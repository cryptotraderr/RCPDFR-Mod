-------
-- Made by: corehimself
-- Created: 2/28/2023
-- Updated: 8/10/2024
-------
local Players = game:GetService("Players");
local MessagingService = game:GetService("MessagingService");
local HTTPService = game:GetService("HttpService");

local function customFunction(actionType: "Kick" | "Warn", playerModerated: Player)
	-- an accessible function to trigger external signals
	-- events, kick, etc as needed
	if (actionType == "Kick") then
		playerModerated:Kick()
	end
end

local function PlayerAdded(player: Player)	
	local messageServiceConn = MessagingService:SubscribeAsync("DTR", function(data)
		data = HTTPService:JSONDecode(data.Data);

		local userId = data.UserIds[1];
		local reason = data.DisplayReason;
		local method = data.Method;

		local player = Players:GetPlayerByUserId(userId)
		if (player) then
			customFunction(method, player);
		end
	end);

	player.AncestryChanged:Connect(function(child: Instance, parent: Instance)
		if (not parent) then
			messageServiceConn:Disconnect();
		end
	end)
end

Players.PlayerAdded:Connect(PlayerAdded)
