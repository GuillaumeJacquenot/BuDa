module Groups exposing (Model, Property, defaultModel, getPropertyIdFromName, property, getPropertyStringFromId, getPropertyFromName)

import Identifier exposing (Identifier)


type alias Property =
    { id : Identifier
    , name : String
    }


type alias Model =
    List Property


defaultModel : Model
defaultModel =
    []


property : Identifier -> String -> Property
property i s =
    { id = i, name = s }


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
                    getPropertyStringFromId id xs


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


getPropertyFromName : String -> Model -> Maybe Property
getPropertyFromName s list =
    case list of
        [] ->
            Nothing

        x :: xs ->
            case x.name == s of
                True ->
                    (Just x)

                False ->
                    getPropertyFromName s xs
