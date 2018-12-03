module GlobalConstants exposing (defaultLNK, defaultPBS)


defaultPBS0 : String
defaultPBS0 =
    "graph app_graph {\noverlap=false\nOmega -- Ship;\nShip -- Main_Machinery;\nOmega -- Fuel;\nShip -- Fuel_Circuit;\nShip -- Electrical_Distribution;\nMain_Machinery -- Main_Engine;\nMain_Machinery -- HTFW_Circuit;\nOmega -- Crew;\nOmega -- Atmosphere;\nOmega -- Seawater;\nShip -- Turbogenerators;\nShip -- Fuel_Tanks;\nShip -- Steam_Generator;\nShip -- Steam_Circuit;\nShip -- FW_Circuit;\nShip -- LTFW_Circuit;\nShip -- Seawater_Circuit;\nShip -- GreyWater_Circuit;\nShip -- Command_Control;\nShip -- Shaft;\nMain_Machinery -- DG;\nMain_Machinery -- Shaft_Generator;\nMain_Machinery -- Admission_Exhaust;\nMain_Machinery -- DG_Cooling;\nHTFW_Circuit -- Preheating_and_Pumps;\nHTFW_Circuit -- valve;\nHTFW_Circuit -- Regulator;\nHTFW_Circuit -- Piping_Junction;\nHTFW_Circuit -- FW_Generator_Bypass;\nHTFW_Circuit -- Temperature_Sensor;\n}\n"


defaultPBS1 : String
defaultPBS1 =
    "graph app_graph {\noverlap=false\nOmega -- Ship;\nShip -- Main_Machinery;\nOmega -- Fuel;\nShip -- Fuel_Circuit;\nShip -- Electrical_Distribution;\nMain_Machinery -- Main_Engine;\nMain_Machinery -- HTFW_Circuit;\n}\n"



-- defaultLNK : String
-- defaultLNK =
--     "graph app_graph {\noverlap=false\nFuel -- Fuel_Tanks;\nShip -- Fuel;\nFuel_Circuit -- Fuel_Tanks;\nFuel_Tanks -- Fuel_Circuit;\nFuel_Circuit -- Main_Engine;\nMain_Engine -- Fuel_Circuit;\nMain_Machinery -- Fuel_Circuit;\nFuel_Circuit -- Main_Machinery;\nFuel_Circuit -- Steam_Generator;\nSteam_Generator -- Fuel_Circuit;\nCommand_Control -- Crew;\nCrew -- Command_Control;\nShip -- Crew;\nCrew -- Ship;\nHTFW_Circuit -- FW_Circuit;\nFW_Circuit -- HTFW_Circuit;\nMain_Machinery -- FW_Circuit;\nFW_Circuit -- Main_Machinery;\nSteam_Circuit -- DG_Cooling;\nDG_Cooling -- Steam_Circuit;\nMain_Machinery -- Steam_Circuit;\nSteam_Circuit -- Main_Machinery;\nHTFW_Circuit -- Electrical_Distribution;\nElectrical_Distribution -- HTFW_Circuit;\nMain_Machinery -- Electrical_Distribution;\nElectrical_Distribution -- Main_Machinery;\nSteam_Circuit -- Steam_Generator;\nSteam_Generator -- Steam_Circuit;\nTurbogenerators -- Steam_Generator;\nSteam_Generator -- Turbogenerators;\nShaft -- Main_Engine;\nMain_Engine -- Shaft;\nMain_Machinery -- Shaft;\nShaft -- Main_Machinery;\nShaft -- Seawater;\nSeawater -- Shaft;\nShip -- Seawater;\nSeawater -- Ship;\nHTFW_Circuit -- Steam_Circuit;\nSteam_Circuit -- HTFW_Circuit;\nMain_Machinery -- Steam_Circuit;\nSteam_Circuit -- Main_Machinery;\nCommand_Control -- Main_Machinery;\nMain_Machinery -- Command_Control;\nDG -- DG_Cooling;\nDG_Cooling -- DG;\nShaft -- Shaft_Generator;\nShaft_Generator -- Shaft;\nMain_Machinery -- Shaft;\nShaft -- Main_Machinery;\n}\n"


defaultLNK0 : String
defaultLNK0 =
    "graph app_graph {\noverlap=false\nFuel -- Fuel_Tanks;\nFuel_Tanks -- Fuel;\nShip -- Fuel;\nFuel -- Ship;\nFuel_Circuit -- Fuel_Tanks;\nFuel_Tanks -- Fuel_Circuit;\nFuel_Circuit -- Main_Engine;\nMain_Engine -- Fuel_Circuit;\nMain_Machinery -- Fuel_Circuit;\nFuel_Circuit -- Main_Machinery;\nFuel_Circuit -- Steam_Generator;\nSteam_Generator -- Fuel_Circuit;\nCommand_Control -- Crew;\nCrew -- Command_Control;\nShip -- Crew;\nCrew -- Ship;\nHTFW_Circuit -- FW_Circuit;\nMain_Machinery -- FW_Circuit;\nSteam_Circuit -- DG_Cooling;\nMain_Machinery -- Steam_Circuit;\nHTFW_Circuit -- Electrical_Distribution;\nMain_Machinery -- Electrical_Distribution;\nSteam_Circuit -- Steam_Generator;\nTurbogenerators -- Steam_Generator;\nShaft -- Main_Engine;\nMain_Machinery -- Shaft;\nShaft -- Seawater;\nShip -- Seawater;\nHTFW_Circuit -- Steam_Circuit;\nMain_Machinery -- Steam_Circuit;\nCommand_Control -- Main_Machinery;\nDG -- DG_Cooling;\nShaft -- Shaft_Generator;\nMain_Machinery -- Shaft;\n}\n"


defaultLNK1 : String
defaultLNK1 =
    "graph app_graph {\noverlap=false\nShip -- Fuel;\n}\n"


defaultPBS : String
defaultPBS =
    defaultPBS0


defaultLNK : String
defaultLNK =
    defaultLNK0
