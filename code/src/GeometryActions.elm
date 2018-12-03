module GeometryActions exposing (addGeometryToNode, deleteGeometryFromNode)

import Identifier exposing (Identifier)
import Node exposing (Node)
import DataModel exposing (Model, childs)


addGeometryToNode : Identifier -> Node -> Model -> Model
addGeometryToNode id n model =
    let
        newNodes =
            List.map
                (\x ->
                    case x.id == n.id of
                        True ->
                            { x | geometry = Just id }

                        False ->
                            x
                )
                model.nodes
    in
        { model | nodes = newNodes }



{--
////////////////////////////////////////////////////////////////////////////////
deleteGeometryFromNode
////////////////////////////////////////////////////////////////////////////////
--}


deleteGeometryFromNode : Identifier -> Node -> Model -> Model
deleteGeometryFromNode id n model =
    let
        newNodes =
            List.map
                (\x ->
                    case x.id == n.id of
                        True ->
                            { x | geometry = Nothing }

                        False ->
                            x
                )
                model.nodes
    in
        { model | nodes = newNodes }
