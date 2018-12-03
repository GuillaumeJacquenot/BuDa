module TranslateTmpDataModel exposing (translateDataModel)

import Identifier exposing (Identifier)
import Node exposing (Node)
import Link exposing (Edge)
import Set exposing (Set)
import DataModel


translateIdentifier : Int -> Set Identifier -> Identifier -> Identifier
translateIdentifier t set id =
    case Set.member id set of
        True ->
            id + t

        False ->
            id


translateNode : Int -> Set Identifier -> Node -> Node
translateNode t set n =
    let
        newId =
            translateIdentifier t set n.id

        newParent =
            case n.parent of
                Nothing ->
                    Nothing

                Just x ->
                    Just (translateIdentifier t set x)
    in
        { n | id = newId, parent = newParent }


translateNodes : Int -> Set Identifier -> List Node -> List Node
translateNodes t set list =
    case list of
        [] ->
            []

        x :: xs ->
            (translateNode t set x) :: (translateNodes t set xs)


translateLink : Int -> Set Identifier -> Edge -> Edge
translateLink t set e =
    let
        newId =
            translateIdentifier t set e.id

        newSource =
            translateIdentifier t set e.source

        newTarget =
            translateIdentifier t set e.target
    in
        { e
            | id = newId
            , source = newSource
            , target = newTarget
        }


translateLinks : Int -> Set Identifier -> List Edge -> List Edge
translateLinks t set list =
    case list of
        [] ->
            []

        x :: xs ->
            (translateLink t set x) :: (translateLinks t set xs)


translateDataModel_ : Int -> Set Identifier -> DataModel.Model -> DataModel.Model
translateDataModel_ t set model =
    let
        newDataModel =
            DataModel.defaultModel
    in
        { newDataModel
            | nodes = translateNodes t set model.nodes
            , edges = translateLinks t set model.edges
        }


makeSetIdentifierfromDataModel : DataModel.Model -> Set Identifier
makeSetIdentifierfromDataModel model =
    let
        s1 =
            Set.fromList (List.map (\x -> x.id) model.nodes)

        s2 =
            Set.fromList (List.map (\x -> x.id) model.edges)
    in
        Set.union s1 s2


translateDataModel : Int -> DataModel.Model -> DataModel.Model
translateDataModel i model =
    let
        set =
            makeSetIdentifierfromDataModel model
    in
        translateDataModel_ i set model
