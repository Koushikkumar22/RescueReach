// Mock data for development and testing purposes
export const mockEmergencyServices = [
  {
    id: 1,
    name: "General Hospital",
    type: "hospital",
    latitude: "40.7138",
    longitude: "-74.0070",
    address: "123 Medical Center Dr",
    phone: "555-0101",
    isActive: true,
  },
  {
    id: 2,
    name: "Police Station",
    type: "police", 
    latitude: "40.7118",
    longitude: "-74.0050",
    address: "456 Safety Blvd",
    phone: "555-0102",
    isActive: true,
  },
  {
    id: 3,
    name: "Fire Department",
    type: "fire",
    latitude: "40.7108", 
    longitude: "-74.0080",
    address: "789 Fire Station Rd",
    phone: "555-0103",
    isActive: true,
  },
];

export const mockIncidents = [
  {
    id: 1,
    type: "accident",
    severity: "medium",
    description: "Traffic accident with minor injuries",
    latitude: "40.7148",
    longitude: "-74.0065",
    address: "Main St & 5th Ave",
    reportedBy: "citizen",
    status: "reported",
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    resolvedAt: null,
  },
];

export const mockResponseTeams = [
  {
    id: 1,
    name: "Ambulance Unit 1",
    type: "ambulance",
    status: "available",
    latitude: "40.7138",
    longitude: "-74.0070",
    assignedIncidentId: null,
  },
  {
    id: 2,
    name: "Fire Truck 7", 
    type: "fire_truck",
    status: "en_route",
    latitude: "40.7108",
    longitude: "-74.0080", 
    assignedIncidentId: 1,
  },
  {
    id: 3,
    name: "Patrol Unit 23",
    type: "police_unit", 
    status: "available",
    latitude: "40.7118",
    longitude: "-74.0050",
    assignedIncidentId: null,
  },
];
