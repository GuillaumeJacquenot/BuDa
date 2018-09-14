port module LinkToJS
    exposing
        ( msg2js
        , makeJsData
        , exportLNK
        , layout
        , loadModel
        , importModel
        , modeltoelm
        , csvmodeltoelm
        , csv2modeltoelm
        , importModeltoelm
        , importCsvModeltoelm
        , doubleclick
        , saveModel
        , sendParentSelection
        , selection
        , nodesPositionToElm
        , requestpositions
        , nodesPositionRequest
        , onOpen
        , onImport
        , saveToImage
        , loadGeometryRequest
        , loadGeometryButton
        , sendGeometryToElm
        , setLayoutName
        , setLayoutNameThenLayout
        )

import Identifier exposing (Identifier)
import Json.Encode exposing (Value)


type alias JsData =
    { tag : String
    , data : Json.Encode.Value
    }


makeJsData : String -> Json.Encode.Value -> JsData
makeJsData tag data =
    { tag = tag
    , data = data
    }


port msg2js : JsData -> Cmd msg



-- sendParentSelection: envoi du node parent vers javascript, pour conserver la selection du parent


port sendParentSelection : String -> Cmd msg


port layout : String -> Cmd msg


port saveModel : String -> Cmd msg


port loadModel : String -> Cmd msg


port exportLNK : String -> Cmd msg


port requestpositions : String -> Cmd msg


port onOpen : String -> Cmd msg


port importModel : String -> Cmd msg


port onImport : String -> Cmd msg


port saveToImage : String -> Cmd msg


port loadGeometryRequest : List Identifier -> Cmd msg


port loadGeometryButton : String -> Cmd msg


port setLayoutName : String -> Cmd msg


port setLayoutNameThenLayout : String -> Cmd msg



{--
//////////////////////////////////////////////////////////////////////////////
-- communication JS -> Elm
//////////////////////////////////////////////////////////////////////////////
--}
-- selection : recuperation de la selection js dans elm


port selection : (List String -> msg) -> Sub msg



-- recuperation du modele charge en js dans elm


port modeltoelm : (String -> msg) -> Sub msg


port csvmodeltoelm : (String -> msg) -> Sub msg


port csv2modeltoelm : (String -> msg) -> Sub msg


port importModeltoelm : (String -> msg) -> Sub msg


port importCsvModeltoelm : (String -> msg) -> Sub msg



-- recuperation du double click dans elm


port doubleclick : (String -> msg) -> Sub msg



-- recuperation des positions des blocs


port nodesPositionToElm : (String -> msg) -> Sub msg



-- demande de sauvegarde des positions


port nodesPositionRequest : (String -> msg) -> Sub msg


port sendGeometryToElm : (String -> msg) -> Sub msg
