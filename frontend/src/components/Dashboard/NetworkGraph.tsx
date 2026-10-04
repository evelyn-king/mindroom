import { Agent, Room, Team } from "@/types/config";
import { pluralize } from "@/lib/utils";
import {
  Bot,
  Home,
  Users,
  Link,
  Activity,
  Trophy,
  Zap,
  BarChart3,
  X,
} from "lucide-react";
import { getSelectionStyles } from "@/components/shared/styles";

interface NetworkGraphProps {
  agents: Agent[];
  rooms: Room[];
  teams: Team[];
  selectedAgentId: string | null;
  selectedRoomId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  onSelectRoom: (roomId: string | null) => void;
  width?: number;
  height?: number;
}

export function NetworkGraph({
  agents,
  rooms,
  teams,
  selectedAgentId,
  selectedRoomId,
  onSelectAgent,
  onSelectRoom,
}: NetworkGraphProps) {
  // Calculate relationship stats
  const totalConnections = agents.reduce(
    (sum, agent) => sum + agent.rooms.length,
    0,
  );
  const averageToolsPerAgent =
    agents.length > 0
      ? agents.reduce((sum, agent) => sum + agent.tools.length, 0) /
        agents.length
      : 0;
  const teamMembership = teams.reduce(
    (sum, team) => sum + team.agents.length,
    0,
  );

  // Most connected room
  const roomConnections = rooms.map((room) => ({
    room,
    connections: room.agents.length,
  }));
  const mostConnectedRoom = roomConnections.reduce(
    (max, curr) => (curr.connections > max.connections ? curr : max),
    roomConnections[0],
  );

  // Most active agent (most tools)
  const mostActiveAgent = agents.reduce(
    (max, curr) => (curr.tools.length > max.tools.length ? curr : max),
    agents[0],
  );

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* Left: System Stats */}
        <div className="space-y-4">
          <div className="text-center p-4 bg-secondary/45 border border-border rounded-lg">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {agents.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Agents
            </div>
          </div>

          <div className="text-center p-4 bg-secondary/45 border border-border rounded-lg">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Home className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {rooms.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Rooms
            </div>
          </div>

          <div className="text-center p-4 bg-secondary/45 border border-border rounded-lg">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {teams.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Teams
            </div>
          </div>
        </div>

        {/* Center: Key Insights */}
        <div className="space-y-4">
          <div className="p-4 bg-secondary/45 border border-border rounded-lg">
            <div className="text-center mb-3">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Link className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {totalConnections}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Connections
              </div>
            </div>
          </div>

          {mostConnectedRoom && (
            <div
              className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${getSelectionStyles(
                selectedRoomId === mostConnectedRoom.room.id,
                "card",
              )} ${
                selectedRoomId !== mostConnectedRoom.room.id
                  ? "bg-secondary/45 border border-border"
                  : ""
              }`}
              onClick={() => onSelectRoom(mostConnectedRoom.room.id)}
            >
              <div className="text-center">
                <div className="text-sm mb-2 flex items-center justify-center gap-1 text-primary">
                  <Trophy className="w-4 h-4" /> Most Connected Room
                </div>
                <div className="font-semibold text-foreground">
                  {mostConnectedRoom.room.display_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {mostConnectedRoom.connections} agents
                </div>
              </div>
            </div>
          )}

          {mostActiveAgent && (
            <div
              className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${getSelectionStyles(
                selectedAgentId === mostActiveAgent.id,
                "card",
              )} ${
                selectedAgentId !== mostActiveAgent.id
                  ? "bg-secondary/45 border border-border"
                  : ""
              }`}
              onClick={() => onSelectAgent(mostActiveAgent.id)}
            >
              <div className="text-center">
                <div className="text-sm mb-2 flex items-center justify-center gap-1 text-primary">
                  <Zap className="w-4 h-4" /> Most Active Agent
                </div>
                <div className="font-semibold text-foreground">
                  {mostActiveAgent.display_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {pluralize(mostActiveAgent.tools.length, "tool")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Relationships */}
        <div className="space-y-4">
          <div className="p-4 bg-secondary/45 border border-border rounded-lg">
            <h4 className="font-semibold mb-3 text-center flex items-center justify-center gap-1 text-foreground">
              <BarChart3 className="w-4 h-4 text-primary" />{" "}
              System Metrics
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Avg. Tools/Agent:
                </span>
                <span className="font-semibold text-foreground">
                  {averageToolsPerAgent.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Team Members:
                </span>
                <span className="font-semibold text-foreground">
                  {teamMembership}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Avg. Agents/Room:
                </span>
                <span className="font-semibold text-foreground">
                  {rooms.length > 0
                    ? (totalConnections / rooms.length).toFixed(1)
                    : "0"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-secondary/45 border border-border rounded-lg">
            <h4 className="font-semibold mb-3 text-center text-foreground flex items-center justify-center gap-1">
              <Activity className="w-4 h-4 text-primary" />{" "}
              Quick Actions
            </h4>
            <div className="space-y-2 text-sm">
              <button
                className="w-full p-2 text-left rounded hover:bg-accent transition-colors text-primary flex items-center"
                onClick={() => {
                  onSelectAgent(null);
                  onSelectRoom(null);
                }}
              >
                <X className="w-4 h-4 mr-2" /> Clear Selection
              </button>
              <div className="text-xs text-muted-foreground text-center mt-3">
                Click items above to explore relationships
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
