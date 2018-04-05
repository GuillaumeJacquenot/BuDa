module Search exposing (Model, defaultModel, search, mustBuildList)

import Node exposing (Node)


type alias Model =
    { nodes : List Node
    , mustBuildList : Bool
    }


defaultModel : Model
defaultModel =
    { nodes = []
    , mustBuildList = False
    }


init_ : String -> List Node -> Model
init_ s list =
    { defaultModel
        | nodes = List.filter (\x -> x.name == s) list
    }


bringToFront_ : Node -> List Node -> List Node
bringToFront_ n l =
    n :: (List.filter (\x -> not (x.id == n.id)) l)


bringToBack_ : Node -> List Node -> List Node
bringToBack_ n l =
    List.concat [ (List.filter (\x -> not (x.id == n.id)) l), [ n ] ]


search : Model -> String -> List Node -> Model
search model s nodes =
    let
        ll =
            init_ s nodes
    in
        case ( List.head model.nodes, model.mustBuildList ) of
            ( Nothing, _ ) ->
                ll

            ( _, True ) ->
                ll

            ( Just x, False ) ->
                { model | nodes = bringToBack_ x model.nodes }


mustBuildList : Model -> Bool -> Model
mustBuildList model b =
    { model | mustBuildList = b }
