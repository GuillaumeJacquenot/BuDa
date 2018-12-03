module Selection exposing (Model, SelectionId, updateModelSelection, decodeFromJSMsg, decodeFromJSId, getFirstSelectionIdentifier)

import Identifier exposing (Identifier)


-- import Node exposing (Node)
-- import Link exposing (Edge)

import Json.Decode
import DataModelDecoders


type alias SelectionId =
    { id : Identifier, err : Bool }


type alias Model =
    List Identifier


selection : Identifier -> Bool -> SelectionId
selection i b =
    { id = i, err = b }


getIdentifier : SelectionId -> Identifier
getIdentifier s =
    s.id


getFirstSelectionIdentifier : Model -> Maybe Identifier
getFirstSelectionIdentifier model =
    case model of
        [] ->
            Nothing

        x :: xs ->
            Just x


updateModelSelection : Model -> List SelectionId -> Model
updateModelSelection model list =
    let
        noError =
            List.all (\s -> not s.err) list

        newModel =
            case noError of
                True ->
                    List.map (\s -> s.id) list

                False ->
                    model
    in
        newModel


decodeFromJSId : String -> SelectionId
decodeFromJSId s =
    let
        x =
            Json.Decode.decodeString (Json.Decode.field "id" DataModelDecoders.decodeIdentifier) s

        select =
            case x of
                Ok v ->
                    --{ id = v, err = False }
                    selection v False

                Err _ ->
                    --{ id = -1, err = True }
                    selection -1 True
    in
        select


decodeFromJSMsg : List String -> List SelectionId
decodeFromJSMsg =
    List.map decodeFromJSId
