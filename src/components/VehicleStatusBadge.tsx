import React from 'react';
import { Vehicle, VehicleStatus, ServiceStatus, GPSStatus } from '../types';
import { resolveVehicleState, ResolvedVehicleState } from '../services/vehicleStateMachine';

interface VehicleStatusBadgeProps {
  vehicle?: Partial<Vehicle>;
  vehicleStatus?: VehicleStatus;
  serviceStatus?: ServiceStatus;
  gpsStatus?: GPSStatus;
  lastGpsTimestamp?: string | number | Date;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showAge?: boolean;
  showDetailsTooltip?: boolean;
  className?: string;
}

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({
  vehicle,
  vehicleStatus,
  serviceStatus,
  gpsStatus,
  lastGpsTimestamp,
  size = 'md',
  showAge = true,
  className = '',
}) => {
  const resolved: ResolvedVehicleState = resolveVehicleState({
    vehicleStatus: vehicleStatus || vehicle?.vehicleStatus || 'ACTIVE',
    serviceStatus: serviceStatus || vehicle?.serviceStatus || 'ACTIVE',
    gpsStatus: gpsStatus || vehicle?.gpsStatus,
    lastGpsTimestamp: lastGpsTimestamp || vehicle?.lastGpsTimestamp || vehicle?.lastGpsUpdate,
  });

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3 py-1.5 gap-2.5 font-medium',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const isLive = resolved.effectiveStatus === 'IN_SERVICE_LIVE';
  const isRecent = resolved.effectiveStatus === 'IN_SERVICE_RECENT';
  const isStale = resolved.effectiveStatus === 'IN_SERVICE_STALE';

  return (
    <div
      className={`inline-flex items-center rounded-full border shadow-sm transition-all ${resolved.statusColor.bg} ${resolved.statusColor.border} ${resolved.statusColor.text} ${sizeClasses[size]} ${className}`}
      title={`Statut: ${resolved.displayStatus} | Véhicule: ${resolved.vehicleStatus} | Service: ${resolved.serviceStatus} | GPS: ${resolved.gpsStatus} (${resolved.lastGpsUpdateFormatted})`}
    >
      {/* Pulse dot or Icon */}
      <span className="relative flex items-center justify-center">
        {isLive && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${dotSizes[size]}`}
          style={{ backgroundColor: resolved.statusColor.hex }}
        />
      </span>

      {/* Main Display Status Label */}
      <span className="font-semibold tracking-tight whitespace-nowrap">
        {resolved.displayStatus}
      </span>

      {/* Age suffix if enabled */}
      {showAge && resolved.lastGpsUpdateFormatted && (
        <span className="text-[11px] opacity-75 whitespace-nowrap font-normal border-l border-current/20 pl-1.5">
          {resolved.lastGpsUpdateFormatted}
        </span>
      )}
    </div>
  );
};
