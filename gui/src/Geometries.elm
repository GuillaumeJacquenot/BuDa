module Geometries exposing (Model, Property, defaultModel, getPropertyIdFromName, property, getImageFromId)

import Identifier exposing (Identifier)


type alias Property =
    { id : Identifier
    , name : String
    , svg : Maybe String
    }


type alias Model =
    List Property


defaultModel : Model
defaultModel =
    []


property : Identifier -> String -> Property
property i s =
    { id = i, name = s, svg = Nothing }


getPropertyStringFromId : Identifier -> Model -> Maybe String
getPropertyStringFromId id list =
    case list of
        [] ->
            Nothing

        x :: xs ->
            case x.id == id of
                True ->
                    (Just x.name)

                False ->
                    Nothing


getPropertyIdFromName : String -> Model -> Maybe Identifier
getPropertyIdFromName s list =
    case list of
        [] ->
            Nothing

        x :: xs ->
            case x.name == s of
                True ->
                    (Just x.id)

                False ->
                    getPropertyIdFromName s xs


getPropertyFromId : Identifier -> Model -> Maybe Property
getPropertyFromId id list =
    case list of
        [] ->
            Nothing

        x :: xs ->
            case x.id == id of
                True ->
                    Just x

                False ->
                    getPropertyFromId id xs


getImageFromId : Identifier -> Model -> Maybe String
getImageFromId id list =
    case getPropertyFromId id list of
        Nothing ->
            Nothing

        Just p ->
            p.svg
