module LinkParameters exposing (Model, Property, defaultModel, getPropertyIdFromName, getPropertyNameFromId, getPropertyFromName, property)

import Identifier exposing (Identifier)


type alias Property =
    { id : Identifier
    , name : String
    }


type alias Model =
    List Property


getPropertyIdFromName : String -> List Property -> Maybe Identifier
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

getPropertyNameFromId : Identifier -> Model -> Maybe String
getPropertyNameFromId id parameters =
    case parameters of
        [] ->
            Nothing

        head :: tail ->
            case head.id == id of
                True ->
                    Just head.name

                False ->
                    getPropertyNameFromId id tail

getPropertyFromName : String -> List Property -> Maybe Property
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


defaultModel : Model
defaultModel =
    []


sampleModel : Model
sampleModel =
    [ { id = 0, name = "Air" }
    , { id = 1, name = "Fresh Water" }
    , { id = 2, name = "Salt Water" }
    , { id = 3, name = "400 V AC" }
    , { id = 4, name = "230 V AC" }
    , { id = 5, name = "48 V DC" }
    , { id = 6, name = "Command & Control" }
      -- , "Digital"
      -- , "DO/HFO"
      -- , "Others"
    ]


property : Identifier -> String -> Property
property i s =
    { id = i, name = s }
