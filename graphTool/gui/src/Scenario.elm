module Scenario exposing (Msg(..), Model, RedoModel, defaultModel, defaultRedoModel, addMsg)

import Identifier exposing (Identifier)
import ElementAttributes exposing (..)
import Link exposing (Edge)
import Node exposing (Node)
import DataModel
import Position
import Layout exposing (Layout)
import Geometries


type Msg
    = NoOp
    | CreateNode String (Maybe Identifier)
    | CreateLink Identifier Identifier
    | DeleteLink Identifier
    | DeleteNode Identifier
    | RenameNode String (Maybe Identifier)
    | CreateParameter String
    | DeleteParameter String
    | UpdateProperty Edge String
    | UpdateAttribute String (Maybe Identifier)
    | UpdateNodeRoles Identifier Role Identifier
    | UpdateState ElementState Identifier
    | LoadModel DataModel.DataModel
    | GroupNodes (List Node) String
    | UpdateOutpowered
    | UpdateNodeGroupProperty Node String
    | CreateGroup String
    | DeleteGroup String
    | CreateGeometry String
    | DeleteGeometry String
    | UpdateNodeGeometryProperty Node String
    | UpdateTightnessForGroup String Identifier
    | UpdateLayoutFromNodeId (Maybe Identifier) (List Position.NodePosition)
    | UpdateLightLayout Layout
    | CtrlC Identifier
    | CtrlX Identifier
    | CtrlV (Maybe Identifier)
    | SendGeometryName Geometries.Property
    | LoadCsvModel String
    | LoadCsv2Model String


type alias Model =
    List Msg


type alias RedoModel =
    Maybe Msg


defaultModel : Model
defaultModel =
    []


defaultRedoModel : RedoModel
defaultRedoModel =
    -- []
    Nothing


addMsg : Msg -> Model -> Model
addMsg msg model =
    msg :: model
