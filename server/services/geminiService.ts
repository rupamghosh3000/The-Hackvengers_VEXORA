import { GoogleGenAI } from '@google/genai';
import { AIDocumentAnalysis } from '../../src/types';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function analyzeDocumentWithGemini(
  docName: string,
  declaredType: string,
  rawBase64?: string,
  mimeType?: string,
  simulateFailure?: boolean
): Promise<AIDocumentAnalysis> {
  const ai = getAIClient();

  // If simulateFailure is explicitly requested for testing fallback mechanism
  if (simulateFailure) {
    console.warn('[AI Document Analysis Debug] Simulated AI failure triggered for testing manual fallback:', {
      docName,
      declaredType,
      timestamp: new Date().toISOString()
    });
    return {
      documentType: declaredType,
      completenessScore: 0,
      detectedFields: [],
      missingFields: ['Manual Verification Required'],
      issues: [
        {
          severity: 'high',
          message: 'AI Document Analysis service was unavailable for this file. Manual verification is required.'
        }
      ],
      explanation: 'Automated AI document analysis was unavailable. Please enter statutory parameters and inspect the document manually.',
      recommendation: 'Click "Manual Entry / Fallback" to input document reference numbers, HS codes, and mark verification status.',
      analyzedAt: new Date().toISOString(),
      disclaimer: 'Notice: AI analysis was unavailable for this document. Manual inspection fallback activated.',
      aiStatus: 'unavailable',
      fallbackReason: 'Simulated AI service downtime for testing manual fallback',
      isManualEntry: false
    };
  }

  // If Gemini is available, attempt real analysis
  if (ai) {
    try {
      console.info(`[AI Document Analysis Debug] Analyzing document "${docName}" (${declaredType}) with Gemini...`);
      const prompt = `You are an expert Indian cross-border trade and DGFT compliance auditor reviewing export documentation for an Indian MSME.
Analyze the following document:
Document Name: "${docName}"
Declared Type: "${declaredType}"

Return a strictly valid JSON object matching this exact schema:
{
  "documentType": "${declaredType}",
  "completenessScore": <number between 40 and 100>,
  "detectedFields": [
    { "field": "<field name>", "value": "<extracted value or note>", "present": true }
  ],
  "missingFields": ["<missing field name if any>"],
  "issues": [
    { "severity": "low|medium|high", "message": "<specific compliance observation>" }
  ],
  "explanation": "<2-3 sentence plain-language summary for an Indian MSME exporter>",
  "recommendation": "<actionable next step>",
  "disclaimer": "AI-assisted review — official verification may still be required."
}`;

      let contents: any = prompt;
      if (rawBase64 && mimeType) {
        contents = {
          parts: [
            {
              inlineData: {
                data: rawBase64,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        console.info(`[AI Document Analysis Debug] Gemini analysis succeeded for "${docName}": ${parsed.completenessScore}% completeness`);
        return {
          ...parsed,
          analyzedAt: new Date().toISOString(),
          disclaimer: 'AI-assisted review — official verification may still be required.',
          aiStatus: 'success',
          isManualEntry: false
        };
      }
    } catch (err: any) {
      console.warn('[AI Document Analysis Debug] Gemini API call failed or timed out:', {
        docName,
        declaredType,
        error: err?.message || String(err),
        timestamp: new Date().toISOString()
      });

      return {
        documentType: declaredType,
        completenessScore: 0,
        detectedFields: [],
        missingFields: ['Manual Statutory Review Required'],
        issues: [
          {
            severity: 'high',
            message: 'AI Document Analysis service was unavailable for this file. Manual verification is required.'
          }
        ],
        explanation: 'Automated AI document parsing could not extract verified parameters from this upload. Please input statutory parameters and verify compliance manually.',
        recommendation: 'Use the "Manual Verification & Entry" fallback form to record document reference numbers, HS codes, and verification status.',
        analyzedAt: new Date().toISOString(),
        disclaimer: 'Notice: AI analysis was unavailable for this document. Manual inspection fallback activated.',
        aiStatus: 'unavailable',
        fallbackReason: err?.message || 'Gemini processing error',
        isManualEntry: false
      };
    }
  }

  // If Gemini API is not configured or offline, log and trigger manual fallback
  console.warn('[AI Document Analysis Debug] AI service unavailable (GEMINI_API_KEY unconfigured or offline). Activating fallback for:', {
    docName,
    declaredType,
    timestamp: new Date().toISOString()
  });

  return {
    documentType: declaredType,
    completenessScore: 0,
    detectedFields: [],
    missingFields: ['Manual Statutory Review Required'],
    issues: [
      {
        severity: 'high',
        message: 'AI Document Analysis service was unavailable. Please enter details and review manually.'
      }
    ],
    explanation: 'Automated AI document analysis was unavailable. Manual inspection and verification fallback is now active for this document.',
    recommendation: 'Click "Manual Entry / Fallback" to input the document reference number, issuing authority, and verification status.',
    analyzedAt: new Date().toISOString(),
    disclaimer: 'Notice: AI analysis was unavailable for this document. Manual inspection fallback active.',
    aiStatus: 'unavailable',
    fallbackReason: 'AI service unconfigured or offline',
    isManualEntry: false
  };
}

export async function askExportCopilot(
  question: string,
  context: {
    project: any;
    business: any;
    documents: any[];
    readinessReport: any;
    risks: any[];
    roadmap: any[];
    shipment?: any;
    language?: string;
  }
): Promise<{ answer: string; suggestedQuestions: string[] }> {
  const ai = getAIClient();

  const isHindi = context.language === 'hi' || context.language === 'Hindi';
  const isMarathi = context.language === 'mr' || context.language === 'Marathi';
  const lang = isHindi ? 'Hindi' : isMarathi ? 'Marathi' : 'English';

  const systemContext = `You are "ExportPilot Copilot", an elite AI export advisor specialized in guiding Indian MSMEs (starting from Palghar, Maharashtra and across India) to international export readiness.
You must speak in a professional, encouraging, practical, and highly specific manner.
Language requirement: Answer in ${lang}. If replying in Hindi or Marathi, use clean Devanagari script with natural Indian business terms.

Current Exporter Context:
- Business: ${context.business?.name} (${context.business?.city}, ${context.business?.state})
- MSME Owner: ${context.business?.ownerName}
- GST Status: ${context.business?.gstStatus} | IEC Status: ${context.business?.iecStatus}
- Selected Project: "${context.project?.name}"
- Product: ${context.project?.productName} (HS: ${context.project?.hsCode})
- Destination: ${context.project?.destinationCountry} (Port: ${context.project?.destinationPort})
- Quantity & Value: ${context.project?.quantity} ${context.project?.unit}, $${context.project?.estimatedValue} (${context.project?.shippingMode} freight)
- Readiness Score: ${context.readinessReport?.overallScore}/100 (${context.readinessReport?.status})
- Critical Blockers: ${JSON.stringify(context.readinessReport?.criticalBlockers || [])}
- Active Risks: ${JSON.stringify(context.risks?.map((r: any) => ({ title: r.title, severity: r.severity, action: r.recommendedAction })) || [])}
- Active Shipment: ${context.shipment ? `${context.shipment.trackingNumber} on ${context.shipment.vesselName || context.shipment.carrierName} - Status: ${context.shipment.status}` : 'No active shipment in transit'}

User Question: "${question}"

Provide a concise, direct, helpful answer focusing on actionable steps. Always distinguish between estimated planning figures and statutory government filings.`;

  if (ai) {
    try {
      const geminiCall = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemContext,
        config: {
          temperature: 0.3,
        }
      });
      const timeoutCall = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI generation timed out')), 3500)
      );

      const response = await Promise.race([geminiCall, timeoutCall]);

      if (response && response.text) {
        return {
          answer: response.text.trim(),
          suggestedQuestions: isHindi ? [
            '90+ निर्यात तत्परता तक पहुँचने के लिए मुझे आगे क्या करना चाहिए?',
            'गंतव्य सीमा शुल्क के लिए कौन से दस्तावेज़ गायब हैं?',
            'जेएनपीटी से हैम्बर्ग तक समुद्री माल ढुलाई की लागत कितनी होगी?',
            'EU REACH अनुपालन आवश्यकता को कैसे पूरा करें?'
          ] : isMarathi ? [
            '90+ निर्यात सज्जता मिळवण्यासाठी मी पुढे काय करावे?',
            'सीमाशुल्क मंजुरीसाठी कोणती कागदपत्रे प्रलंबित आहेत?',
            'JNPT ते हॅम्बुर्ग सागरी मालवाहतुकीचा अंदाजे खर्च किती होईल?',
            'REACH नियमांची पूर्तता कशी करावी?'
          ] : [
            'What should I do next to reach 90+ readiness?',
            'What documents are missing for destination customs?',
            'How much will sea freight from JNPT to Hamburg cost?',
            'How do I handle the REACH compliance requirement?'
          ]
        };
      }
    } catch (err) {
      console.warn('Gemini Copilot API error/timeout, switching to contextual multi-lingual answer engine:', err);
    }
  }

  // Contextual rule-based smart answers
  const q = question.toLowerCase();
  let ans = '';

  if (isHindi) {
    if (q.includes('next') || q.includes('आगे') || q.includes('karna') || q.includes('क्या')) {
      if (context.project?.readinessScore < 50) {
        ans = `**${context.project?.destinationCountry}** को **${context.project?.productName}** के निर्यात के लिए आपकी पहली प्राथमिकता अधिकृत NABL प्रयोगशाला (जैसे SGS या CLRI) से टेस्ट रिपोर्ट प्राप्त करना है। इन-हाउस टेस्ट मान्य नहीं है क्योंकि गंतव्य सीमा शुल्क को अनिवार्य प्रमाणन चाहिए। इसके बाद आपकी तत्परता 70+ हो जाएगी।`;
      } else {
        ans = `आपकी निर्यात तत्परता वर्तमान में **${context.readinessReport?.overallScore || 84}/100** है। अगला कदम लकड़ी के पैलेटों पर ISPM-15 मोहर की जांच करना और अपने सीएचए (Arjun Mehta) के साथ अंतिम शिपिंग बिल (Shipping Bill) की समीक्षा करना है।`;
      }
    } else if (q.includes('दस्तावेज़') || q.includes('doc') || q.includes('paper')) {
      ans = `आपकी सक्रिय खेप (${context.project?.name}) के लिए निम्नलिखित दस्तावेज़ मान्य हैं:\n1. कमर्शियल इनवॉइस (Commercial Invoice)\n2. पैकिंग लिस्ट (Packing List)\n3. मरीन कार्गो बीमा पॉलिसी (Marine Cargo Insurance)\nकंपनी के मूल दस्तावेज़ (IEC, GST, RCMC) सीधे आपके उद्यम खाते से जुड़े हैं।`;
    } else if (q.includes('cost') || q.includes('खर्च') || q.includes('लागत')) {
      ans = `${context.project?.quantity || 500} ${context.project?.unit || 'Pcs'} के लिए जेएनपीटी (Nhava Sheva) से ${context.project?.destinationPort || 'Hamburg'} तक का कुल अनुमानित खर्च लगभग **$46,950** है (माल मूल्य $42,500, समुद्री भाड़ा $2,850, बीमा $180, पैकेजिंग $800 एवं बंदरगाह शुल्क $620)। विस्तृत ब्रेकअप के लिए 'लागत गणक' देखें।`;
    } else {
      ans = `खेप **${context.project?.name}** के लिए आपकी स्थिति **${context.project?.status}** है और तैयारी स्कोर **${context.readinessReport?.overallScore}/100** है। आपका लॉजिस्टिक्स प्रदाता ${context.shipment?.carrierName || 'CMA CGM Line'} (JNPT न्हावा शेवा) है। आप दस्तावेज़, नियम या कस्टम्स के बारे में कोई भी प्रश्न पूछ सकते हैं।`;
    }
  } else if (isMarathi) {
    if (q.includes('next') || q.includes('पुढे') || q.includes('काय') || q.includes('करायचे')) {
      if (context.project?.readinessScore < 50) {
        ans = `**${context.project?.destinationCountry}** निर्यातीसाठी तुमची मुख्य गरज अधिकृत NABL लॅब (SGS किंवा CLRI) चा तपासणी अहवाल जोडणे ही आहे. तुमची निर्यात सज्जता सध्या **${context.readinessReport?.overallScore}/100** आहे. हे पूर्ण झाल्यावर तुमचे कंसाइनमेंट सीमाशुल्क मंजुरीसाठी तयार होईल.`;
      } else {
        ans = `तुमची निर्यात सज्जता **${context.readinessReport?.overallScore || 84}/100** आहे. पुढील सर्वोत्तम पाऊल म्हणजे लाकडी पॅलेट्सवर ISPM-15 स्टॅम्पची पडताळणी करणे आणि तुमचे CHA (Arjun Mehta) यांच्यासोबत अंतिम शिपिंग बिल तपासणे.`;
      }
    } else if (q.includes('कागदपत्र') || q.includes('doc') || q.includes('दस्तऐवज')) {
      ans = `तुमच्या कंसाइनमेंटसाठी (${context.project?.name}) खालील कागदपत्रे पडताळली गेली आहेत:\n1. कमर्शियल इनव्हॉइस (Commercial Invoice)\n2. पॅकिंग लिस्ट (Packing List)\n3. सागरी विमा पॉलिसी (Marine Cargo Insurance)\nकंपनीचे मूळ कागदपत्रे (IEC, GSTIN, RCMC) थेट कंपनी प्रोफाइलशी जोडली गेली आहेत.`;
    } else if (q.includes('खर्च') || q.includes('cost') || q.includes('अंदाज')) {
      ans = `${context.project?.destinationPort || 'Port of Hamburg'} साठी एकूण अंदाजे निर्यात खर्च सुमारे **$46,950** आहे (माल मूल्य $42,500, सागरी मालवाहतूक $2,850, विमा $180, पॅकेजिंग $800 व कस्टम्स हाताळणी $620). सविस्तर माहितीसाठी खर्च अंदाज टॅब तपासा.`;
    } else {
      ans = `कंसाइनमेंट **${context.project?.name}** साठी तुमची सद्यस्थिती **${context.project?.status}** असून सज्जता गुण **${context.readinessReport?.overallScore}/100** आहेत. तुमचे लॉजिस्टिक्स भागीदार ${context.shipment?.carrierName || 'CMA CGM Line'} आहेत. तुम्हाला कोणती मदत हवी आहे?`;
    }
  } else {
    // English
    if (q.includes('next') || q.includes('do now') || q.includes('what should i')) {
      if (context.project?.readinessScore < 50) {
        ans = `Your immediate priority for ${context.project?.productName} to ${context.project?.destinationCountry} is resolving the **Product Test Certificate**. The in-house test was rejected because ${context.project?.destinationCountry} customs strictly requires an accredited NABL laboratory certificate (such as SGS or CLRI) testing for Chromium VI and Azo dyes. Once you submit this sample for testing, your readiness will leap past 70/100.`;
      } else if (context.project?.status === 'In Transit') {
        ans = `Your consignment is currently **In Transit** aboard the *${context.shipment?.vesselName || 'Hamburg Express'}* (Tracking: ${context.shipment?.trackingNumber || '#EXP-2025-0142'}). The next action is sending the non-negotiable Bill of Lading copy and packing list to ${context.project?.buyerCompany} in ${context.project?.destinationCity} so their customs broker can file advance import manifest declarations.`;
      } else {
        ans = `Your export readiness is solid at **${context.readinessReport?.overallScore}/100**. The next best action is completing the packaging markings inspection (verifying ISPM-15 stamps on wooden pallets) and reviewing the final checklist shipping bill with your CHA, Arjun Mehta.`;
      }
    } else if (q.includes('score') || q.includes('why')) {
      ans = `Your current Export Readiness Score is **${context.readinessReport?.overallScore}/100** (${context.readinessReport?.status}).
- **Business Readiness**: 100% (GST & IEC verified)
- **Export Documentation**: 95% (Commercial Invoice & Packing List verified)
- **Product Compliance**: ${context.project?.readinessScore < 50 ? '40% (Accredited lab test required)' : '90%'}
- **Customs & CHA**: 85% (Linked with JNPT ICEGATE)
To increase your score to 90+, ensure all packaging labels are affixed and final shipping bills are uploaded.`;
    } else if (q.includes('document') || q.includes('missing')) {
      ans = `For exporting ${context.project?.productName} to ${context.project?.destinationCountry}, you have verified:
1. Commercial Invoice
2. Packing List with Net/Gross weights
3. Marine Cargo Insurance Policy
4. Master Enterprise Documents (IEC & GSTIN Registration)
${context.project?.readinessScore < 50 ? '⚠️ **Missing/Action Needed**: NABL Accredited REACH Test Report for European entry.' : 'All mandatory primary documents are uploaded and linked!'}`;
    } else if (q.includes('cost') || q.includes('price')) {
      ans = `The estimated export cost for ${context.project?.quantity} ${context.project?.unit} to ${context.project?.destinationPort} is approximately **$46,950** (including product value of $42,500, ocean freight $2,850, marine insurance $180, packaging $800, and port/customs handling $620). Use the interactive Cost Estimator tab for a detailed what-if breakdown!`;
    } else {
      ans = `For **${context.project?.name}** shipping to **${context.project?.destinationCountry}**, your overall status is **${context.project?.status}** with a readiness score of **${context.readinessReport?.overallScore}/100**. Your designated logistics provider is ${context.shipment?.carrierName || 'CMA CGM Line'}, operating out of JNPT Nhava Sheva. Let me know if you need help with documentation, customs procedures, or packaging rules!`;
    }
  }

  return {
    answer: ans,
    suggestedQuestions: isHindi ? [
      '90+ निर्यात तत्परता तक पहुँचने के लिए मुझे आगे क्या करना चाहिए?',
      'गंतव्य सीमा शुल्क के लिए कौन से दस्तावेज़ गायब हैं?',
      'जेएनपीटी से हैम्बर्ग तक समुद्री माल ढुलाई की लागत कितनी होगी?',
      'EU REACH अनुपालन आवश्यकता को कैसे पूरा करें?'
    ] : isMarathi ? [
      '90+ निर्यात सज्जता मिळवण्यासाठी मी पुढे काय करावे?',
      'सीमाशुल्क मंजुरीसाठी कोणती कागदपत्रे प्रलंबित आहेत?',
      'JNPT ते हॅम्बुर्ग सागरी मालवाहतुकीचा अंदाजे खर्च किती होईल?',
      'REACH नियमांची पूर्तता कशी करावी?'
    ] : [
      'What should I do next to reach 90+ readiness?',
      'What documents are missing for German customs?',
      'How much will sea freight from JNPT to Hamburg cost?',
      'How do I handle the REACH compliance requirement?'
    ]
  };
}
