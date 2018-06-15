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
        outpoweredNodes =
            findOutpoweredNodes model

        newNodeList =
            List.map (\x -> updateOutpoweredNode outpoweredNodes x) model.nodes

        _ =
            Debug.log "test" newNodeList
    in
        { model | nodes = newNodeList }


findOutpoweredNodes : Model -> List Node
findOutpoweredNodes model =
    let
        prodNodeList =
            producerList model

        initialProducersIdList =
            List.map (\x -> x.id) prodNodeList

        consumerNodeList =
            consumerList model

        initialConsumersIdList =
            List.map (\x -> x.id) consumerNodeList

        extendedProducerIdList =
            extendedProducerList [] initialProducersIdList model

        outpoweredNodesIds =
            removeListFromAnother initialConsumersIdList extendedProducerIdList
    in
        nodeListFromIds model outpoweredNodesIds



-- Get a list of all consumers node in model


consumerList : Model -> List Node
consumerList model =
    List.filter (\x -> (x.nodeType == Consumer && x.state == RAS)) model.nodes



-- Get a list of all producers node in model


producerList : Model -> List Node
producerList model =
    List.filter (\x -> (x.nodeType == Producer && x.state == RAS)) model.nodes



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
                if (justNode.state == RAS) then
                    True
                else
                    False



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


updateOutpoweredNode : List Node -> Node -> Node
updateOutpoweredNode outpoweredNodeList node =
    case outpoweredNodeList of
        [] ->
            node

        x :: xs ->
            if (x.id == node.id) then
                { x | highLighted = 99 }
            else
                updateOutpoweredNode xs node
