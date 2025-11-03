/**
 * Client Service - Private API
 * 
 * This service handles client-related API calls that require authentication.
 * Used for admin functions, client management, and authenticated client data.
 */

import { api } from '../service.apiSW';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  moveCount: number;
  totalSpent: number;
  averageRating: number;
  lastMoveDate: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  preferences: {
    moveType: string[];
    preferredMovers: string[];
    specialRequirements: string[];
    communicationMethod: 'email' | 'phone' | 'sms';
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

export interface ClientMove {
  id: string;
  clientId: string;
  moveDate: string;
  fromAddress: string;
  toAddress: string;
  moveType: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  actualCost?: number;
  moverId?: string;
  rating?: number;
  review?: string;
  specialRequirements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientCommunication {
  id: string;
  clientId: string;
  type: 'email' | 'phone' | 'sms' | 'in-person';
  subject: string;
  message: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

// =============================================================================
// CLIENT API FUNCTIONS
// =============================================================================

/**
 * Get all clients (admin function)
 */
export const getAllClients = async (): Promise<ClientProfile[]> => {
  try {
    console.log('🔧 Fetching all clients from private API...');
    const response = await api.makeRequest('/v0/clients', {}, true) as any;
    
    const clients: ClientProfile[] = response.clients?.map((client: any) => ({
      id: client.id || client._id,
      name: client.name || client.client_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode || client.zip_code,
      country: client.country || 'US',
      moveCount: client.moveCount || client.move_count || 0,
      totalSpent: client.totalSpent || client.total_spent || 0,
      averageRating: client.averageRating || client.average_rating || 0,
      lastMoveDate: client.lastMoveDate || client.last_move_date,
      joinDate: client.joinDate || client.join_date,
      status: client.status || 'active',
      preferences: {
        moveType: client.preferences?.moveType || client.preferences?.move_type || [],
        preferredMovers: client.preferences?.preferredMovers || client.preferences?.preferred_movers || [],
        specialRequirements: client.preferences?.specialRequirements || client.preferences?.special_requirements || [],
        communicationMethod: client.preferences?.communicationMethod || client.preferences?.communication_method || 'email'
      },
      emergencyContact: client.emergencyContact ? {
        name: client.emergencyContact.name,
        phone: client.emergencyContact.phone,
        relationship: client.emergencyContact.relationship
      } : undefined,
      notes: client.notes
    })) || [];

    console.log('✅ Clients loaded:', clients.length);
    return clients;
  } catch (error) {
    console.error('❌ Failed to fetch clients:', error);
    throw error;
  }
};

/**
 * Get client by ID
 */
export const getClientById = async (clientId: string): Promise<ClientProfile | null> => {
  try {
    console.log('🔧 Fetching client by ID:', clientId);
    const response = await api.makeRequest(`/v0/clients/${clientId}`, {}, true) as any;
    
    if (!response.client) return null;

    const client: ClientProfile = {
      id: response.client.id || response.client._id,
      name: response.client.name || response.client.client_name,
      email: response.client.email,
      phone: response.client.phone,
      address: response.client.address,
      city: response.client.city,
      state: response.client.state,
      zipCode: response.client.zipCode || response.client.zip_code,
      country: response.client.country || 'US',
      moveCount: response.client.moveCount || response.client.move_count || 0,
      totalSpent: response.client.totalSpent || response.client.total_spent || 0,
      averageRating: response.client.averageRating || response.client.average_rating || 0,
      lastMoveDate: response.client.lastMoveDate || response.client.last_move_date,
      joinDate: response.client.joinDate || response.client.join_date,
      status: response.client.status || 'active',
      preferences: {
        moveType: response.client.preferences?.moveType || response.client.preferences?.move_type || [],
        preferredMovers: response.client.preferences?.preferredMovers || response.client.preferences?.preferred_movers || [],
        specialRequirements: response.client.preferences?.specialRequirements || response.client.preferences?.special_requirements || [],
        communicationMethod: response.client.preferences?.communicationMethod || response.client.preferences?.communication_method || 'email'
      },
      emergencyContact: response.client.emergencyContact ? {
        name: response.client.emergencyContact.name,
        phone: response.client.emergencyContact.phone,
        relationship: response.client.emergencyContact.relationship
      } : undefined,
      notes: response.client.notes
    };

    console.log('✅ Client loaded:', client.name);
    return client;
  } catch (error) {
    console.error('❌ Failed to fetch client:', error);
    throw error;
  }
};

/**
 * Get client moves
 */
export const getClientMoves = async (clientId: string): Promise<ClientMove[]> => {
  try {
    console.log('🔧 Fetching client moves:', clientId);
    const response = await api.makeRequest(`/v0/clients/${clientId}/moves`, {}, true) as any;
    
    const moves: ClientMove[] = response.moves?.map((move: any) => ({
      id: move.id || move._id,
      clientId: move.clientId || move.client_id,
      moveDate: move.moveDate || move.move_date,
      fromAddress: move.fromAddress || move.from_address,
      toAddress: move.toAddress || move.to_address,
      moveType: move.moveType || move.move_type,
      status: move.status || 'scheduled',
      estimatedCost: move.estimatedCost || move.estimated_cost || 0,
      actualCost: move.actualCost || move.actual_cost,
      moverId: move.moverId || move.mover_id,
      rating: move.rating,
      review: move.review,
      specialRequirements: move.specialRequirements || move.special_requirements || [],
      createdAt: move.createdAt || move.created_at,
      updatedAt: move.updatedAt || move.updated_at
    })) || [];

    console.log('✅ Client moves loaded:', moves.length);
    return moves;
  } catch (error) {
    console.error('❌ Failed to fetch client moves:', error);
    throw error;
  }
};

/**
 * Get client communication history
 */
export const getClientCommunications = async (clientId: string): Promise<ClientCommunication[]> => {
  try {
    console.log('🔧 Fetching client communications:', clientId);
    const response = await api.makeRequest(`/v0/clients/${clientId}/communications`, {}, true) as any;
    
    const communications: ClientCommunication[] = response.communications?.map((comm: any) => ({
      id: comm.id || comm._id,
      clientId: comm.clientId || comm.client_id,
      type: comm.type || 'email',
      subject: comm.subject,
      message: comm.message,
      timestamp: comm.timestamp,
      direction: comm.direction || 'outbound',
      status: comm.status || 'sent'
    })) || [];

    console.log('✅ Client communications loaded:', communications.length);
    return communications;
  } catch (error) {
    console.error('❌ Failed to fetch client communications:', error);
    throw error;
  }
};

/**
 * Update client profile
 */
export const updateClientProfile = async (clientId: string, updates: Partial<ClientProfile>): Promise<boolean> => {
  try {
    console.log('🔧 Updating client profile:', clientId);
    const response = await api.makeRequest(`/v0/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, true) as any;
    
    console.log('✅ Client profile updated');
    return response.success || true;
  } catch (error) {
    console.error('❌ Failed to update client profile:', error);
    throw error;
  }
};

/**
 * Create new client
 */
export const createClient = async (clientData: Partial<ClientProfile>): Promise<ClientProfile | null> => {
  try {
    console.log('🔧 Creating new client...');
    const response = await api.makeRequest('/v0/clients', {
      method: 'POST',
      body: JSON.stringify(clientData)
    }, true) as any;
    
    if (!response.client) return null;

    const client: ClientProfile = {
      id: response.client.id || response.client._id,
      name: response.client.name || response.client.client_name,
      email: response.client.email,
      phone: response.client.phone,
      address: response.client.address,
      city: response.client.city,
      state: response.client.state,
      zipCode: response.client.zipCode || response.client.zip_code,
      country: response.client.country || 'US',
      moveCount: response.client.moveCount || response.client.move_count || 0,
      totalSpent: response.client.totalSpent || response.client.total_spent || 0,
      averageRating: response.client.averageRating || response.client.average_rating || 0,
      lastMoveDate: response.client.lastMoveDate || response.client.last_move_date,
      joinDate: response.client.joinDate || response.client.join_date,
      status: response.client.status || 'active',
      preferences: {
        moveType: response.client.preferences?.moveType || response.client.preferences?.move_type || [],
        preferredMovers: response.client.preferences?.preferredMovers || response.client.preferences?.preferred_movers || [],
        specialRequirements: response.client.preferences?.specialRequirements || response.client.preferences?.special_requirements || [],
        communicationMethod: response.client.preferences?.communicationMethod || response.client.preferences?.communication_method || 'email'
      },
      emergencyContact: response.client.emergencyContact ? {
        name: response.client.emergencyContact.name,
        phone: response.client.emergencyContact.phone,
        relationship: response.client.emergencyContact.relationship
      } : undefined,
      notes: response.client.notes
    };

    console.log('✅ Client created:', client.name);
    return client;
  } catch (error) {
    console.error('❌ Failed to create client:', error);
    throw error;
  }
};

/**
 * Send communication to client
 */
export const sendClientCommunication = async (clientId: string, communication: Omit<ClientCommunication, 'id' | 'clientId' | 'timestamp'>): Promise<boolean> => {
  try {
    console.log('🔧 Sending communication to client:', clientId);
    const response = await api.makeRequest(`/v0/clients/${clientId}/communications`, {
      method: 'POST',
      body: JSON.stringify(communication)
    }, true) as any;
    
    console.log('✅ Communication sent');
    return response.success || true;
  } catch (error) {
    console.error('❌ Failed to send communication:', error);
    throw error;
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getAllClients,
  getClientById,
  getClientMoves,
  getClientCommunications,
  updateClientProfile,
  createClient,
  sendClientCommunication
};
