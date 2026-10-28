/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';
import { calculateStraightLineDistanceKm } from '../../services/addressService';

interface IndiaMapViewProps {
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  donorName?: string;
  recipientName?: string;
  status?: string;
}

export const IndiaMapView: React.FC<IndiaMapViewProps> = ({
  pickupAddress,
  pickupLat = 19.0178,
  pickupLng = 72.8173,
  deliveryAddress,
  deliveryLat = 19.0028,
  deliveryLng = 72.8423,
  donorName = 'Pickup Location',
  recipientName = 'Delivery Destination',
  status = 'ASSIGNED',
}) => {
  const [gpsRequested, setGpsRequested] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>('Location tracking ready on request');
  const [volunteerCoords, setVolunteerCoords] = useState<{ lat: number; lng: number } | null>(null);

  const straightLineKm = calculateStraightLineDistanceKm(pickupLat, pickupLng, deliveryLat, deliveryLng);

  const handleRequestLiveLocation = () => {
    setGpsRequested(true);
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by this browser.');
      return;
    }
    setGpsStatus('Requesting browser location permission...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setVolunteerCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsStatus(`GPS Active (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`);
      },
      err => {
        setGpsStatus(`GPS Permission Denied / Unavailable: ${err.message}. Using registered addresses.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-stone-900 text-stone-100 rounded-2xl overflow-hidden shadow-lg border border-stone-800">
      {/* Header bar */}
      <div className="bg-stone-950 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-sm text-stone-200">Redistribution Route Corridor (India)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-medium">
            Straight-Line: {straightLineKm} km
          </span>
          <span className="text-xs bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded-full font-mono">
            {status}
          </span>
        </div>
      </div>

      {/* SVG Canvas Corridor Visualizer */}
      <div className="relative h-64 bg-stone-950/90 flex items-center justify-center p-6 select-none overflow-hidden">
        {/* Subtle Map Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#2d3748_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

        <svg className="w-full h-full max-w-lg" viewBox="0 0 500 220">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Background track path */}
          <path
            d="M 80,110 C 200,40 300,180 420,110"
            fill="none"
            stroke="#374151"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Animated Route Flowing Gradient Path */}
          <motion.path
            d="M 80,110 C 200,40 300,180 420,110"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeDasharray="8,6"
            strokeLinecap="round"
            animate={{ strokeDashoffset: [0, -56] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          />

          {/* Pickup Pin with Pulse */}
          <g transform="translate(80, 110)">
            <circle r="16" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
            <circle r="10" fill="#10B981" />
            <circle r="4" fill="#FFFFFF" />
            <text x="0" y="26" textAnchor="middle" fill="#A7F3D0" fontSize="11" fontWeight="700">
              Pickup (Donor)
            </text>
          </g>

          {/* Recipient Pin with Pulse */}
          <g transform="translate(420, 110)">
            <circle r="16" fill="#3B82F6" fillOpacity="0.2" className="animate-ping" />
            <circle r="10" fill="#3B82F6" />
            <circle r="4" fill="#FFFFFF" />
            <text x="0" y="26" textAnchor="middle" fill="#BFDBFE" fontSize="11" fontWeight="700">
              Dropoff (NGO)
            </text>
          </g>

          {/* Midpoint / Volunteer Node with Floating Animation */}
          <motion.g
            animate={{
              y: [0, -6, 0],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            transform="translate(250, 110)"
          >
            <circle r="9" fill="#F59E0B" filter="url(#glow)" />
            <circle r="4" fill="#FFFFFF" />
            <text x="0" y="-14" textAnchor="middle" fill="#FDE68A" fontSize="10" fontWeight="600">
              {straightLineKm} km active corridor
            </text>
          </motion.g>
        </svg>

        {/* Live Volunteer Marker overlay if GPS is active */}
        {volunteerCoords && (
          <div className="absolute top-4 left-4 bg-emerald-900/90 text-emerald-200 text-xs px-3 py-1.5 rounded-lg border border-emerald-600 flex items-center gap-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Volunteer GPS: {volunteerCoords.lat.toFixed(4)}°N, {volunteerCoords.lng.toFixed(4)}°E
          </div>
        )}
      </div>

      {/* Address Details & GPS action */}
      <div className="p-4 bg-stone-900 border-t border-stone-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Donor Collection: {donorName}</span>
            </div>
            <p className="text-stone-300 truncate">{pickupAddress}</p>
            <p className="text-stone-500 font-mono mt-0.5">Coordinates: {pickupLat}°N, {pickupLng}°E (India)</p>
          </div>

          <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Recipient Handover: {recipientName}</span>
            </div>
            <p className="text-stone-300 truncate">{deliveryAddress}</p>
            <p className="text-stone-500 font-mono mt-0.5">Coordinates: {deliveryLat}°N, {deliveryLng}°E (India)</p>
          </div>
        </div>

        {/* GPS Control bar with privacy disclosure */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-stone-400">
            <AlertCircle className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span className="italic">{gpsStatus}</span>
          </div>

          <button
            type="button"
            onClick={handleRequestLiveLocation}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 transition font-medium cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            {gpsRequested ? 'Refresh GPS' : 'Share Location for Route'}
          </button>
        </div>
      </div>
    </div>
  );
};
