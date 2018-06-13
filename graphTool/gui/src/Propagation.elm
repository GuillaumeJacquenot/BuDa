module Propagation exposing (propagation)

import Identifier exposing (Identifier)
import DataModel exposing (Model)
import Link exposing (Edge)
import Node exposing (Node)
import ElementAttributes exposing (..)


propagation : Model -> Model
propagation model =
    model


findUnalimentedNodes : Model -> List Node
findUnalimentedNodes model =
    let
        initialProducersSet =
            Set.fromList (producerList model)

        extendedProducers =
            extendedProducerList Set.empty initialProducersSet model

        unalimentedNodes =
            Set.diff (Set.fromList (consumerList model) extendedProducers)
    in
        Set.toList unalimentedNodes


consumerList : Model -> List Node
consumerList model =
    List.filter (\x -> (x.nodeType == Consumer && x.state == RAS)) model.dataModel.nodes



-- Get a list of all producers node in model


producerList : Model -> List Node
producerList model =
    List.filter (\x -> (x.nodeType == Producer && x.state == RAS)) model.dataModel.nodes



-- Get the list of all nodes connected with a given node (link in RAS state)


getConnectedNodes : Model -> Node -> List Node
getConnectedNodes model node =
    let
        connectedEdgesList =
            edgesFromNodeList model node

        sourceEdges =
            List.filter (\x -> x.source == node.id) connectedEdgesList

        targetEdges =
            List.filter (\x -> x.target == node.id) connectedEdgesList
    in
        List.map (\x -> x.target) sourceEdges ++ List.map (\x -> x.source) targetEdges



-- Get a list of all edges with no problem connected to a given node


edgesFromNodeList : Model -> Node -> List Edge
edgesFromNodeList model node =
    List.filter (\edge -> ((edge.source == node.id || edge.target == node.id) && edge.state == RAS)) model.dataModel.edges


extendedProducerList : Set Identifier -> Set Identifier -> model -> Set Identifier
extendedProducerList doneNodesSet toDoNodesSet model =
    case toDoNodesSet of
        [] ->
            doneNodesSet

        x :: xs ->
            let
                connectedNodes =
                    nodeIdList getConnectedNodes model.dataModel.getNodeFromId x

                doneNodesSet =
                    doneNodesSet :: x

                newToDoNodes =
                    Set.diff xs :: connectedNodes doneNodesSet
            in
                extendedProducerList doneNodesSet newToDoNodes


nodeIdList : List Node -> List Identifier
nodeIdList nodeList =
    List.map (\x -> x.id) nodeList


nodeListFromIds : Model -> List Identifier -> List Node
nodeListFromIds model idList =
    List.map (\x -> model.dataModel.getNodeFromId x) idList
