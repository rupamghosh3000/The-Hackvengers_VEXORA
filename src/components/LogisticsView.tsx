import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import { Shipment, TrackingEvent } from '../types';
import { 
  Ship, 
  Truck, 
  Plane, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Anchor, 
  Compass, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Box, 
  Layers, 
  FileText,
  Plus,
  Send,
  Sparkles,
  Search,
  RefreshCw,
  Edit3,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const LogisticsView: React.FC = () => {
  const { activeProjectDetail, refreshProjectData, showToast, user } = useApp();
  const [shipment, setShipment] = useState<Shipment | null>(activeProjectDetail?.shipment || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Message chat with Port CHA
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Arjun Mehta (Port CHA)', text: 'LEO copy received from JNPT customs appraising officer. Container successfully loaded onto Hamburg Express.', time: '12 Dec • 03:00 PM' },
    { sender: 'Vikram Singhania', text: 'Thank you Arjun. Please confirm negotiable Bill of Lading scan has been uploaded.', time: '12 Dec • 04:15 PM' },
    { sender: 'Arjun Mehta (Port CHA)', text: 'BL MAEU928419 issued and verified. Tracking telemetry linked to Indian Customs ICEGATE.', time: '13 Dec • 11:20 AM' }
  ]);

  // ETA update modal
  const [isEditingEta, setIsEditingEta] = useState(false);
  const [newEtaDate, setNewEtaDate] = useState(shipment?.estimatedArrivalDate || '2025-01-14');

  // Status update modal
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Shipment['status']>(shipment?.status || 'In Transit');

  useEffect(() => {
    if (activeProjectDetail?.shipment) {
      setShipment(activeProjectDetail.shipment);
      setNewEtaDate(activeProjectDetail.shipment.estimatedArrivalDate);
      setSelectedStatus(activeProjectDetail.shipment.status);
    }
  }, [activeProjectDetail]);

  const handleSearchTracking = async (queryToUse?: string) => {
    const q = (queryToUse || searchQuery).trim();
    if (!q) return;
    setIsSearching(true);
    try {
      const result = await apiClient.trackShipment(q);
      setShipment(result);
      setNewEtaDate(result.estimatedArrivalDate);
      setSelectedStatus(result.status);
      showToast(`Tracked shipment ${result.trackingNumber} via carrier telemetry`);
    } catch (err: any) {
      showToast(err.message || `No active shipment found matching "${q}"`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSimulateNextMilestone = async () => {
    if (!shipment) return;
    setIsSimulating(true);
    try {
      const res = await apiClient.simulateLogisticsMilestone(shipment.id);
      setShipment(res.shipment);
      await refreshProjectData();
      showToast(`🚢 New Transit Event: ${res.newEvent.title} at ${res.newEvent.location}`);
    } catch (err: any) {
      showToast(err.message || 'Simulation completed or shipment at destination');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !shipment) return;
    const textToSend = messageInput.trim();
    setMessageInput('');
    setIsSendingMsg(true);

    // Optimistic append
    const userMsg = {
      sender: user?.name || 'Vikram Singhania',
      text: textToSend,
      time: 'Just now'
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const reply = await apiClient.sendLogisticsMessage(
        shipment.id,
        user?.name || 'Vikram Singhania',
        textToSend
      );

      if (reply.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'Arjun Mehta (Port CHA)',
            text: reply.reply!,
            time: 'Just now'
          }
        ]);
      }
      showToast('Dispatch message recorded on port ledger');
    } catch (err: any) {
      showToast('Message sent to CHA');
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleSaveEta = async () => {
    if (!shipment) return;
    try {
      const updated = await apiClient.updateLogisticsEta(shipment.id, newEtaDate);
      setShipment(updated);
      setIsEditingEta(false);
      await refreshProjectData();
      showToast(`Updated vessel arrival ETA to ${newEtaDate}`);
    } catch (err: any) {
      showToast('Failed to update ETA');
    }
  };

  const handleSaveStatus = async () => {
    if (!shipment) return;
    try {
      const updated = await apiClient.updateLogisticsStatus(
        shipment.id, 
        selectedStatus, 
        `Status updated by ${user?.name || 'Authorized Exporter'}`
      );
      setShipment(updated);
      setIsUpdatingStatus(false);
      await refreshProjectData();
      showToast(`Shipment status set to "${selectedStatus}"`);
    } catch (err: any) {
      showToast('Failed to update status');
    }
  };

  const demoChips = [
    { label: 'Container CMAU-782194-0', query: 'CMAU-782194-0' },
    { label: 'BL MAEU928419', query: 'MAEU928419' },
    { label: 'Air AWB 098-44129841', query: '098-44129841' },
    { label: 'Tracking #EXP-INNSA-HAM-2024-884', query: 'EXP-INNSA-HAM-2024-884' }
  ];

  if (!shipment) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 m-6 max-w-xl mx-auto space-y-4">
        <Ship className="w-12 h-12 text-teal-700 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-stone-900">Track Ocean & Air Freight</h3>
          <p className="text-xs text-stone-500 mt-1">
            Query real-time container status via the mock logistics provider API
          </p>
        </div>
        <div className="flex space-x-2 max-w-sm mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Enter Container, BL or Tracking No..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden"
          />
          <button
            onClick={() => handleSearchTracking()}
            className="px-4 py-2 rounded-xl bg-teal-800 text-white font-semibold text-xs"
          >
            Track
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-900 font-mono">
              LOGISTICS DESK
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Ocean & Air Freight Tracking Console
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Connected to Mock Logistics Provider Service • Swappable with Maersk / CMA CGM / Freightify API
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Simulate Next Event Button */}
          <button
            onClick={handleSimulateNextMilestone}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
            title="Simulate container movement to the next maritime waypoint"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Next Milestone'}</span>
          </button>

          {/* Edit ETA Button */}
          <button
            onClick={() => setIsEditingEta(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition flex items-center space-x-1"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Update ETA</span>
          </button>

          {/* Update Status Button */}
          <button
            onClick={() => setIsUpdatingStatus(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
            <span>Change Status</span>
          </button>
        </div>
      </div>

      {/* Global Tracking Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchTracking()}
              placeholder="Query any Container No, BL No, AWB, or Consignment ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
            />
          </div>
          <button
            onClick={() => handleSearchTracking()}
            disabled={isSearching}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition shrink-0"
          >
            {isSearching ? 'Searching...' : 'Track Carrier API'}
          </button>
        </div>

        {/* Demo search chips for easy evaluation */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-stone-400">Quick Test Samples:</span>
          {demoChips.map(chip => (
            <button
              key={chip.query}
              onClick={() => {
                setSearchQuery(chip.query);
                handleSearchTracking(chip.query);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-stone-100 hover:bg-teal-50 hover:text-teal-900 text-stone-600 transition"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Vessel Route Card + CHA Messaging */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vessel Telematics & Waypoint Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dark Telematics Bar */}
          <div className="bg-stone-900 text-white rounded-2xl p-6 border border-stone-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-teal-700/60 text-teal-200 flex items-center justify-center font-bold">
                  {shipment.carrierMode === 'Air' ? <Plane className="w-6 h-6" /> : <Ship className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{shipment.vesselName || shipment.carrierName}</h3>
                  <p className="text-xs text-stone-400">
                    Carrier: {shipment.carrierName} • Voyage: {shipment.voyageNumber || 'V-4481'}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-stone-400">Tracking Reference</span>
                <div className="text-sm font-mono font-bold text-teal-300">{shipment.trackingNumber}</div>
                <div className="text-[10px] text-stone-400 font-mono mt-0.5">BL: {shipment.blNumber || 'MAEU928419'}</div>
              </div>
            </div>

            {/* Consignment Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Container & Seal</span>
                <span className="font-bold text-white text-xs font-mono">{shipment.containerNumber || 'CMAU-782194-0'}</span>
                <span className="text-[10px] text-teal-400 block font-mono">Seal: {shipment.customsSealNumber || 'IN-889124'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Telemetry Speed</span>
                <span className="font-bold text-white text-sm">{shipment.speedKnots || 16.4} knots</span>
                <span className="text-[10px] text-stone-400 block">Course: {shipment.courseHeading || '284° WNW'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Gross Weight & Volume</span>
                <span className="font-bold text-white text-sm">{shipment.grossWeightKg} kg</span>
                <span className="text-[10px] text-stone-400 block">{shipment.volumeCbm} CBM ({shipment.packageCount} pkgs)</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Estimated Arrival</span>
                <span className="font-bold text-teal-300 text-sm">{shipment.estimatedArrivalDate}</span>
                <span className="text-[10px] text-emerald-400 block font-semibold">Status: {shipment.status}</span>
              </div>
            </div>
          </div>

          {/* Interactive Route Waypoint Map Representation */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-teal-700" />
                <span>Maritime Transit Corridor ({shipment.originPort} → {shipment.destinationPort})</span>
              </h4>
              <span className="text-xs text-stone-500 font-mono">
                {shipment.currentCoordinates?.latitude || '18.9°N'}, {shipment.currentCoordinates?.longitude || '71.4°E'}
              </span>
            </div>

            {/* Stylized Port Waypoint Bar */}
            <div className="p-5 rounded-xl bg-teal-950 text-white relative overflow-hidden my-4">
              <div className="grid grid-cols-4 gap-2 text-center text-xs relative z-10">
                <div className="space-y-1">
                  <div className="w-4 h-4 rounded-full bg-teal-400 mx-auto ring-4 ring-teal-800" />
                  <div className="font-bold truncate">{shipment.originPort}</div>
                  <div className="text-[10px] text-teal-300">Departure Port</div>
                </div>
                <div className="space-y-1">
                  <div className="w-4 h-4 rounded-full bg-teal-400 mx-auto ring-4 ring-teal-800 animate-pulse" />
                  <div className="font-bold text-teal-300 truncate">{shipment.currentLocation || 'In Transit'}</div>
                  <div className="text-[10px] text-teal-300">Current Position</div>
                </div>
                <div className="space-y-1 opacity-70">
                  <div className="w-4 h-4 rounded-full bg-stone-500 mx-auto" />
                  <div className="font-bold truncate">Customs Berth</div>
                  <div className="text-[10px] text-stone-400">Entry Corridor</div>
                </div>
                <div className="space-y-1 opacity-70">
                  <div className="w-4 h-4 rounded-full bg-stone-500 mx-auto" />
                  <div className="font-bold truncate">{shipment.destinationPort}</div>
                  <div className="text-[10px] text-stone-400">Final Discharge</div>
                </div>
              </div>

              {/* Connecting line */}
              <div className="absolute top-7 left-12 right-12 h-0.5 bg-teal-700 z-0" />
            </div>

            {/* Milestone Chronology */}
            <div className="space-y-3 mt-5">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Logistics Milestones & ICEGATE Clearances ({shipment.events.length})
                </h5>
                <span className="text-[11px] text-teal-800 font-semibold">
                  Last telemetry update: Just now
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {shipment.events.map((ev, idx) => (
                  <div key={idx} className="py-3 flex items-start space-x-3 text-xs">
                    <div className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 flex items-center justify-center ${
                      ev.completed ? 'bg-teal-700 text-white' : 'bg-stone-200 text-stone-400'
                    }`}>
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-xs">{ev.title}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{ev.timestamp}</span>
                      </div>
                      <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">{ev.description}</p>
                      <span className="text-[10px] text-stone-400 flex items-center space-x-1 mt-1 font-medium">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{ev.location}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Freight Forwarder & Port CHA Desk */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">{shipment.carrierContact || 'Arjun Mehta'}</h4>
                <p className="text-xs text-stone-500">Port Customs House Agent (CHA)</p>
                <p className="text-[10px] text-teal-800 font-mono">Customs License: 11/2014 • JNPT</p>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between text-xs border-b border-stone-100">
              <span className="text-stone-500">Direct Port Hotline:</span>
              <a href={`tel:${shipment.carrierPhone || '+91 98332 99014'}`} className="font-bold text-teal-900 hover:underline">
                {shipment.carrierPhone || '+91 98332 99014'}
              </a>
            </div>

            {/* Direct Messages Log */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Direct Dispatch Communications
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Agent Online</span>
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-xl text-xs ${
                      m.sender.startsWith(user?.name?.split(' ')[0] || 'Vikram') 
                        ? 'bg-teal-50 text-teal-950 ml-4 border border-teal-100' 
                        : 'bg-stone-50 text-stone-800 mr-4 border border-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1 font-semibold">
                      <span>{m.sender}</span>
                      <span>{m.time}</span>
                    </div>
                    <p className="leading-snug text-xs">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Reply Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-stone-100 flex items-center space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Query Port CHA Arjun Mehta..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              disabled={isSendingMsg}
            />
            <button
              type="submit"
              disabled={isSendingMsg || !messageInput.trim()}
              className="p-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white transition disabled:opacity-50"
              title="Send dispatch inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ETA Editor Modal */}
      {isEditingEta && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-stone-900">Update Consignment ETA</h3>
            <p className="text-stone-500">Enter revised arrival date based on maritime carrier schedule:</p>
            <input
              type="date"
              value={newEtaDate}
              onChange={e => setNewEtaDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-stone-300 text-xs font-mono"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsEditingEta(false)}
                className="px-3 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEta}
                className="px-4 py-1.5 rounded-lg bg-teal-800 text-white font-semibold"
              >
                Update ETA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Editor Modal */}
      {isUpdatingStatus && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-stone-900">Update Consignment Status</h3>
            <p className="text-stone-500">Set current milestone lifecycle state on port ledger:</p>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as Shipment['status'])}
              className="w-full px-3 py-2 border rounded-xl border-stone-300 text-xs"
            >
              <option value="Booking Confirmed">Booking Confirmed</option>
              <option value="Customs Cleared">Customs Cleared (LEO)</option>
              <option value="In Transit">In Transit (Sea/Air)</option>
              <option value="Arrived at Destination">Arrived at Destination</option>
              <option value="Delivered">Delivered to Consignee</option>
            </select>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsUpdatingStatus(false)}
                className="px-3 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-1.5 rounded-lg bg-teal-800 text-white font-semibold"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
