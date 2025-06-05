import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Hospital, Shield, Flame, CheckCircle, Clock } from "lucide-react";
import type { Incident, ResponseTeam } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function EmergencyServicesDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents/active"],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const { data: responseTeams = [] } = useQuery<ResponseTeam[]>({
    queryKey: ["/api/response-teams"],
    refetchInterval: 5000,
  });

  const updateIncidentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/incidents/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents/active"] });
      toast({
        title: "Incident Updated",
        description: "Incident status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update incident status.",
        variant: "destructive",
      });
    },
  });

  const updateTeamStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/response-teams/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/response-teams"] });
      toast({
        title: "Team Status Updated",
        description: "Response team status has been updated.",
      });
    },
  });

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case "medical":
        return <Hospital className="h-4 w-4" />;
      case "crime":
        return <Shield className="h-4 w-4" />;
      case "fire":
        return <Flame className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getIncidentColor = (type: string) => {
    switch (type) {
      case "medical":
        return "text-red-600";
      case "crime":
        return "text-blue-600";
      case "fire":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTeamIcon = (type: string) => {
    switch (type) {
      case "ambulance":
        return <Hospital className="h-4 w-4" />;
      case "police_unit":
        return <Shield className="h-4 w-4" />;
      case "fire_truck":
        return <Flame className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTeamColor = (type: string) => {
    switch (type) {
      case "ambulance":
        return "text-red-600";
      case "police_unit":
        return "text-blue-600";
      case "fire_truck":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "en_route":
        return "bg-red-500 animate-pulse";
      case "busy":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const incidentDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - incidentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const handleAcceptIncident = (incidentId: number) => {
    updateIncidentStatusMutation.mutate({ id: incidentId, status: "acknowledged" });
  };

  const handleResolveIncident = (incidentId: number) => {
    updateIncidentStatusMutation.mutate({ id: incidentId, status: "resolved" });
  };

  return (
    <div className="w-full h-full bg-white border-l shadow-xl overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Emergency Dashboard</h2>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        </div>

        {/* Active Incidents */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Active Incidents ({activeIncidents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeIncidents.length > 0 ? (
              activeIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={getIncidentColor(incident.type)}>
                        {getIncidentIcon(incident.type)}
                      </span>
                      <span className="font-medium text-gray-900 capitalize">
                        {incident.type.replace('_', ' ')} Emergency
                      </span>
                    </div>
                    <Badge variant={getSeverityVariant(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <p className="text-sm text-gray-600">
                      {incident.address || "Location not specified"}
                    </p>
                    {incident.description && (
                      <p className="text-sm text-gray-700">{incident.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Reported {formatTimeAgo(incident.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      Status: {incident.status.replace('_', ' ')}
                    </Badge>
                    <div className="space-x-2">
                      {incident.status === "reported" && (
                        <Button
                          size="sm"
                          onClick={() => handleAcceptIncident(incident.id)}
                          disabled={updateIncidentStatusMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          Accept
                        </Button>
                      )}
                      {incident.status === "acknowledged" && (
                        <Button
                          size="sm"
                          onClick={() => handleResolveIncident(incident.id)}
                          disabled={updateIncidentStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          Resolve
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No active incidents</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Team Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Response Teams</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {responseTeams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className={getTeamColor(team.type)}>
                    {getTeamIcon(team.type)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{team.name}</p>
                    <p className="text-xs text-gray-600 capitalize">
                      {team.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(team.status)}`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
