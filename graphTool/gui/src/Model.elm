module Model
    exposing
        ( Model
        , TmpDataModel
        , ViewType(..)
        , SelectionType(..)
        , defaultModel
        , defaultTmpDataModel
        )

import Identifier exposing (Identifier)
import DataModel
import Selection
import LinkParameters
import Set exposing (Set)
import Scenario
import SpecialKey
import LayoutMenu
import Search


type ViewType
    = BULL
    | PBS
    | ALL
    | ALL_LIGHT
    | GEOMETRY


type SelectionType
    = PARENT
    | LINK (Maybe Identifier)


type alias TmpDataModel =
    { m_id : Maybe Identifier, data : DataModel.Model }


defaultTmpDataModel : TmpDataModel
defaultTmpDataModel =
    { m_id = Nothing, data = DataModel.defaultModel }


type alias Model =
    { dataModel : DataModel.Model
    , subModel : DataModel.Model
    , tmpDataModel : TmpDataModel
    , input : String
    , inputFile : String
    , selection : Selection.Model
    , loadModelId : String
    , viewType : ViewType
    , nodeViewId : Maybe Identifier
    , parameters : LinkParameters.Model
    , exportFlux : Set Identifier
    , error : Maybe String
    , selectionType : SelectionType
    , undo : Scenario.Model
    , redo : Scenario.RedoModel
    , specialKey : SpecialKey.Model
    , geometryId : Maybe Identifier
    , selectedGeometryId : Maybe Identifier
    , layoutMenu : LayoutMenu.Model
    , showFunctionalChain : Bool
    , showGeometries : Bool
    , showParameters : Bool
    , propagationDone : Bool
    , searchModel : Search.Model
    }


defaultModel : Model
defaultModel =
    { dataModel = DataModel.defaultModel
    , subModel = DataModel.defaultModel
    , tmpDataModel = defaultTmpDataModel
    , input = "undefined"
    , inputFile = "undefined"
    , selection = []
    , loadModelId = "loadModel"
    , viewType = BULL
    , nodeViewId = Nothing
    , parameters = LinkParameters.defaultModel
    , exportFlux = Set.empty
    , error = Nothing
    , selectionType = PARENT
    , undo = Scenario.defaultModel
    , redo = Scenario.defaultRedoModel
    , specialKey = SpecialKey.defaultModel
    , geometryId = Nothing
    , selectedGeometryId = Nothing
    , layoutMenu = LayoutMenu.defaultModel
    , showFunctionalChain = False
    , showGeometries = False
    , showParameters = False
    , propagationDone = False
    , searchModel = Search.defaultModel
    }
