module Propagation exposing (propagation)

import Identifier exposing (Identifier)
import DataModel exposing (Model)
import Link exposing (Edge)
import Node exposing (Node)
import ElementAttributes exposing (..)
import Set exposing (..)


propagation : Model -> Model
propagation model =
    let
        initialNodeList =
            List.map (\x -> { x | highLighted = 0 }) model.nodes

        outpoweredNodesIds =
            findOutpoweredNodes model

        hsNodes =
            List.filter (\x -> x.state == HS) initialNodeList

        outpoweredNodes =
            (nodeListFromIds model outpoweredNodesIds) ++ hsNodes

        consumerNodeList =
            consumerList model

        initialConsumersIdList =
            List.map (\x -> x.id) consumerNodeList

        newNodeList =
            List.map (\x -> updateOutpoweredNode outpoweredNodes initialConsumersIdList x) initialNodeList

        outAndRASNodeIds =
            outpoweredNodesIds ++ List.map (\x -> x.id) hsNodes

        initialEdgeList =
            List.map (\x -> { x | highLighted = 0 }) model.edges

        newEdgeList =
            findOutpoweredEdges initialEdgeList outAndRASNodeIds
    in
        { model | nodes = newNodeList, edges = newEdgeList }



-- Returns a list of edges where outpowered ones are highlighted


findOutpoweredEdges : List Edge -> List Identifier -> List Edge
findOutpoweredEdges edges outNodeIdList =
    List.map (\x -> updateOutpoweredEdge x outNodeIdList) edges



-- Update the highlight attribute of an edge if it's outpowered


updateOutpoweredEdge : Edge -> List Identifier -> Edge
updateOutpoweredEdge edge outNodeIdList =
    if ((List.member edge.source outNodeIdList) && (List.member edge.target outNodeIdList)) then
        { edge | highLighted = 4 }
    else
        edge


findOutpoweredNodes : Model -> List Identifier
findOutpoweredNodes model =
    let
        prodNodeList =
            producerList model

        initialProducersIdList =
            List.map (\x -> x.id) prodNodeList

        modelNodeIdList =
            List.map (\x -> x.id) model.nodes

        extendedProducerIdList =
            extendedProducerList [] initialProducersIdList model
    in
        removeListFromAnother modelNodeIdList extendedProducerIdList



-- Get a list of all RAS consumers node in model


consumerList : Model -> List Node
consumerList model =
    List.filter (\node -> ((isConsumer node) && node.state == RAS)) model.nodes


isConsumer : Node -> Bool
isConsumer node =
    hasRole Consumer node

isProducer : Node -> Bool
isProducer node =
    hasRole Producer node


hasRole : Role -> Node -> Bool
hasRole role node =
    List.any (\networkRole -> networkRole.role == role) node.roles

-- Get a list of all RAS producers node in model


producerList : Model -> List Node
producerList model =
    List.filter (\node -> ((isProducer node) && node.state == RAS)) model.nodes



-- Get the list of all nodes connected with a given node (link in RAS state)


extendedProducerList : List Identifier -> List Identifier -> Model -> List Identifier
extendedProducerList doneNodesList toDoNodesList model =
    case toDoNodesList of
        [] ->
            doneNodesList

        x :: xs ->
            let
                node =
                    DataModel.getNodeFromId x model.nodes

                connectedNodes =
                    getConnectedNodes model node

                extendedToDoList =
                    List.append xs connectedNodes

                newDoneNodeList =
                    List.append doneNodesList [ x ]

                newToDoNodesList =
                    removeListFromAnother extendedToDoList newDoneNodeList
            in
                extendedProducerList newDoneNodeList newToDoNodesList model


removeListFromAnother : List Identifier -> List Identifier -> List Identifier
removeListFromAnother initialList toRemoveList =
    let
        initialSet =
            Set.fromList initialList

        toRemoveSet =
            Set.fromList toRemoveList
    in
        Set.toList (Set.diff initialSet toRemoveSet)


removeDuplicate : List Identifier -> List Identifier
removeDuplicate idList =
    let
        idSet =
            Set.fromList idList
    in
        Set.toList idSet


getConnectedNodes : Model -> Maybe Node -> List Identifier
getConnectedNodes model node =
    case node of
        Nothing ->
            []

        Just justNode ->
            let
                connectedEdgesList =
                    edgesFromNodeList model justNode

                sourceEdges =
                    List.filter (\x -> x.source == justNode.id) connectedEdgesList

                targetEdges =
                    List.filter (\x -> x.target == justNode.id) connectedEdgesList

                connectedNodes =
                    List.map (\x -> x.target) sourceEdges ++ List.map (\x -> x.source) targetEdges
            in
                List.filter (\x -> validNodes model x == True) connectedNodes



-- Check whether a node is valid or not


validNodes : Model -> Identifier -> Bool
validNodes model nodeId =
    let
        node =
            DataModel.getNodeFromId nodeId model.nodes
    in
        case node of
            Nothing ->
                False

            Just justNode ->
                justNode.state == RAS



-- Get a list of all edges with no problem connected to a given node


edgesFromNodeList : Model -> Node -> List Edge
edgesFromNodeList model node =
    List.filter (\edge -> ((edge.source == node.id || edge.target == node.id) && edge.state == RAS)) model.edges


nodeIdList : List Node -> List Identifier
nodeIdList nodeList =
    List.map (\x -> x.id) nodeList


nodeListFromIds : Model -> List Identifier -> List Node
nodeListFromIds model idList =
    let
        maybeNodeList =
            List.map (\x -> DataModel.getNodeFromId x model.nodes) idList
    in
        List.filterMap (\x -> x) maybeNodeList


updateOutpoweredNode : List Node -> List Identifier -> Node -> Node
updateOutpoweredNode outpoweredNodeList consumersIdList node =
    case outpoweredNodeList of
        [] ->
            node

        x :: xs ->
            if (x.id == node.id) then
                if (List.member x.id consumersIdList) then
                    { x | highLighted = 3 }
                else
                    { x | highLighted = 2 }
            else
                updateOutpoweredNode xs consumersIdList node
