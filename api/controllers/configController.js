/**
 * Config Controller
 * Handles configuration endpoints (roles/teams from JSON files)
 */

const fs = require('fs');
const path = require('path');
const { successResponse, serverErrorResponse } = require('../utils/responseHelpers');

class ConfigController {
    /**
     * Load roles configuration from JSON file
     */
    static loadRolesConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'roles.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configData);
            return config.roles.filter(role => role.is_active);
        } catch (error) {
            console.error('❌ Error loading roles config:', error.message);
            return [];
        }
    }

    /**
     * Load teams configuration from JSON file
     */
    static loadTeamsConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'teams.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('❌ Error loading teams config:', error.message);
            return { teams: [], layers: [] };
        }
    }

    /**
     * Get roles from JSON file
     */
    static async getRoles(req, res) {
        try {
            const roles = ConfigController.loadRolesConfig();
            return successResponse(res, roles, 'Roles retrieved successfully', 200, {
                count: roles.length,
                source: 'JSON file'
            });
        } catch (error) {
            console.error('❌ Get roles error:', error.message);
            return serverErrorResponse(res, 'Failed to load roles configuration', error.message);
        }
    }

    /**
     * Get teams from JSON file
     */
    static async getTeams(req, res) {
        try {
            const config = ConfigController.loadTeamsConfig();
            
            // Add layer_name to each team for easier frontend display
            const teamsWithLayerInfo = config.teams.map(team => {
                const layer = config.layers.find(l => l.layer_code === team.layer);
                return {
                    ...team,
                    layer_name: layer ? layer.layer_name : team.layer
                };
            });

            res.json({
                success: true,
                teams: teamsWithLayerInfo,
                layers: config.layers,
                count: teamsWithLayerInfo.length,
                source: 'JSON file'
            });
        } catch (error) {
            console.error('❌ Get teams error:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to load teams configuration',
                code: 'TEAMS_ERROR'
            });
        }
    }
}

module.exports = ConfigController;
