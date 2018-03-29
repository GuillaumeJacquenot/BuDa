port module LinkToJS
    exposing
        ( exportLNK
        , layout
        , loadModel
        , importModel
        , modeltoelm
        , csvmodeltoelm
        , importModeltoelm
        , importCsvModeltoelm
        , doubleclick
        , saveModel
        , sendDataPBSModel
        , sendDataBullesModel
        , sendDataFlatModel
        , sendDataAllModel
        , sendDataGeometryModel
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
        , MqttToJSEvent
        , mqttToJS
        , mqttFromJS
        )

import Identifier exposing (Identifier)
import Json.Decode


type alias MqttToJSEvent =
    { tag : String
    , data : Json.Decode.Value
    }


type alias MqttFromJSEvent =
    { tag : String
    , data : Json.Decode.Value
    }



{--
//////////////////////////////////////////////////////////////////////////////
-- communication Elm -> JS
//////////////////////////////////////////////////////////////////////////////
--}
-- sendDataPBSModel: envoi du modele PBS vers javascript


port sendDataPBSModel : String -> Cmd msg



-- sendDataBullesModel: envoi du modele Bulles vers javascript


port sendDataBullesModel : String -> Cmd msg


port sendDataGeometryModel : String -> Cmd msg


port sendDataFlatModel : String -> Cmd msg


port sendDataAllModel : String -> Cmd msg



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


port mqttToJS : MqttToJSEvent -> Cmd msg



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


port importModeltoelm : (String -> msg) -> Sub msg


port importCsvModeltoelm : (String -> msg) -> Sub msg



-- recuperation du double click dans elm


port doubleclick : (String -> msg) -> Sub msg



-- recuperation des positions des blocs


port nodesPositionToElm : (String -> msg) -> Sub msg



-- demande de sauvegarde des positions


port nodesPositionRequest : (String -> msg) -> Sub msg


port sendGeometryToElm : (String -> msg) -> Sub msg


port mqttFromJS : (MqttFromJSEvent -> msg) -> Sub msg
