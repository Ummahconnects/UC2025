"use client";

import React from 'react';
import { useLocationContext } from '@/contexts/location/useLocationContext';
import { MosqueService } from '@/lib/services/mosqueService.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export const LocationTestComponent: React.FC = () => {
  const { location, isLoading, requestLocation } = useLocationContext();
  const [mosques, setMosques] = React.useState<any[]>([]);
  const [mosqueLoading, setMosqueLoading] = React.useState(false);
  const [mosqueError, setMosqueError] = React.useState<string | null>(null);

  const testLocationAndMosques = async () => {
    setMosqueLoading(true);
    setMosqueError(null);

    try {
      // Test mosque fetching with location
      const fetchedMosques = await MosqueService.getMosques(1, 10, location || undefined);
      setMosques(fetchedMosques);
    } catch (error) {
      setMosqueError(error instanceof Error ? error.message : 'Failed to fetch mosques');
    } finally {
      setMosqueLoading(false);
    }
  };

  React.useEffect(() => {
    if (location) {
      testLocationAndMosques();
    }
  }, [location]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Mosque Data Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Status */}
          <div>
            <h3 className="text-sm font-medium mb-2">Location Status</h3>
            {isLoading ? (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Detecting location...</span>
              </div>
            ) : location ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Location Detected</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  <div><strong>City:</strong> {location.city || 'Unknown'}</div>
                  <div><strong>State:</strong> {location.state || 'Unknown'}</div>
                  <div><strong>Country:</strong> {location.country || 'Unknown'}</div>
                  <div className="text-xs mt-1">
                    <strong>Coordinates:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  Location not available. Make sure location permissions are enabled.
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={requestLocation}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Getting Location...' : 'Refresh Location'}
            </Button>
          </div>

          {/* Mosque Data Test */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Mosque Data Test</h3>
            {mosqueError ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {mosqueError}
                </AlertDescription>
              </Alert>
            ) : mosqueLoading ? (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading mosques...</span>
              </div>
            ) : mosques.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Mosques Loaded Successfully</span>
                </div>
                <div className="text-sm text-green-700">
                  Found {mosques.length} mosques
                  {location && mosques.some(m => m.distance !== undefined) && (
                    <span> with distance calculations</span>
                  )}
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {mosques.slice(0, 5).map((mosque, index) => (
                    <div key={mosque.id || index} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="font-medium">{mosque.name}</div>
                      <div className="text-gray-600">
                        {mosque.city && mosque.state ? `${mosque.city}, ${mosque.state}` : mosque.address || 'Address not available'}
                        {mosque.distance !== undefined && (
                          <span className="ml-2 text-blue-600">({mosque.distance.toFixed(1)}km)</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {mosques.length > 5 && (
                    <div className="text-xs text-gray-500">... and {mosques.length - 5} more</div>
                  )}
                </div>
              </div>
            ) : location ? (
              <div className="text-sm text-gray-600">
                No mosques found. This could indicate an issue with the mosque data or database connection.
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Waiting for location to test mosque data...
              </div>
            )}
            {location && (
              <Button
                onClick={testLocationAndMosques}
                disabled={mosqueLoading}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                {mosqueLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Test Mosque Data
              </Button>
            )}
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2">
              {location && mosques.length > 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">✅ Location and mosque data working correctly!</span>
                </div>
              ) : location ? (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">⚠️ Location detected but mosque data needs attention</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">❌ Location not available - check permissions</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};





