module Messages exposing (Msg(..))

import Model
import Keyboard
import Link exposing (Edge)
import Dom exposing (focus)
import Node exposing (Node)
import ElementAttributes exposing (..)


type Msg
    = FocusOn String
    | FocusResult (Result Dom.Error ())
    | CreateNode
    | RenameNode
    | CreateLink
    | InputChange String
    | InputFileChange String
    | Selection (List String)
    | ModelToElm String
    | CsvModelToElm String
    | Csv2ModelToElm String
    | ImportModelToElm String
    | ImportCsvModeltoElm String
    | NodesPositionToElm String
    | SaveModel
    | LoadModel
    | SwitchToView Model.ViewType
    | KeyUps Keyboard.KeyCode
    | KeyDowns Keyboard.KeyCode
    | DoubleClick String
    | CheckProperty Edge String
    | CheckFlux String
    | ExportLink
    | CreateParameter
    | DeleteParameter
    | UpdateAttribute String
    | GroupNodes
    | CheckNodeGroupProperty Node String
    | CreateGroup
    | DeleteGroup
    | HighLightGroup String
    | SelectedParameters String
    | UpdateTightness
    | Layout
    | GetPositions
    | Undo
    | Redo
    | NodesPositionRequest String
    | OnOpen
    | OnImport
    | ImportModel
    | AskForMessages
    | NewMessage String
    | SaveToImage
    | CreateGeometry
    | DeleteGeometry
    | CheckNodeGeometryProperty Node String
    | HighLightGeometry String
    | LoadGeometry
    | LoadGeometryButton String
    | SendGeometryToElm String
    | SwitchToLayout String
    | SwitchElemType ElementType
    | SwitchElemState ElementState
    | ShowHideFunctionalChain
    | ShowHideGeometries
    | ShowHideParameters
    | Verification
    | Propagation
    | OnNotificationClick
    | UserChange String
    | UrlChange String
    | MqttConnect
    | MqttDisconnect
    | NoOp
