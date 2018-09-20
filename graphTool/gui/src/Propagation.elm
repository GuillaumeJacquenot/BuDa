module Propagation exposing (propagation, getStateSummary)

import Identifier exposing (Identifier)
import DataModel exposing (Model)
import Link exposing (Edge)
import Node exposing (Node)
import ElementAttributes exposing (..)
import Set exposing (..)
import Debug


type alias Graph =
    { nodes : List Node
    , edges : List Edge
    }


type alias StateSummary =
    { ko : Set Identifier
    , affected : Set Identifier
    }


getEdgesFromNodeId : List Edge -> Identifier -> List Edge
getEdgesFromNodeId edges nodeId =
    List.filter (\x -> x.source == nodeId) edges


getEdgesToNodeId : List Edge -> Identifier -> List Edge
getEdgesToNodeId edges nodeId =
    List.filter (\x -> x.target == nodeId) edges


getConnectedNodeIds : List Edge -> Identifier -> List Identifier
getConnectedNodeIds edges nodeId =
    let
        sourceEdges =
            getEdgesFromNodeId edges nodeId

        targetEdges =
            getEdgesToNodeId edges nodeId

        connectedNodeIds =
            List.map (\x -> x.target) sourceEdges ++ List.map (\x -> x.source) targetEdges
    in
        connectedNodeIds


getAllConnectedNodeIds : List Edge -> Identifier -> Set Identifier
getAllConnectedNodeIds edges nodeId =
    Debug.log (toString nodeId) <| Set.fromList <| getConnectedNodeIdsRecursively [ nodeId ] [] edges


getConnectedNodeIdsRecursively : List Identifier -> List Identifier -> List Edge -> List Identifier
getConnectedNodeIdsRecursively nextNodeIds doneNodeIds edges =
    case nextNodeIds of
        [] ->
            doneNodeIds

        nodeId :: nodeIds ->
            let
                connectedNodes =
                    getConnectedNodeIds edges nodeId

                extendedToDoList =
                    nodeIds ++ connectedNodes

                newDoneNodeList =
                    nodeId :: doneNodeIds

                newToDoNodesList =
                    removeListFromAnother extendedToDoList newDoneNodeList
            in
                getConnectedNodeIdsRecursively newToDoNodesList newDoneNodeList edges


getSubGraphForNetwork : Identifier -> Graph -> Graph
getSubGraphForNetwork parameterId graph =
    let
        -- Keep edges in network
        edges =
            List.filter (\edge -> Set.member parameterId edge.parameters) graph.edges
    in
        { graph | edges = edges }


getConnectedProducerIds : Set Identifier -> Set Identifier -> Set Identifier
getConnectedProducerIds producerIds connectedIds =
    Set.intersect producerIds connectedIds


isNodeNotConnectedToAProducer : List Edge -> Set Identifier -> Identifier -> Bool
isNodeNotConnectedToAProducer edges producerIds nodeId =
    let
        connectedNodeIds =
            getAllConnectedNodeIds edges nodeId

        connectedProducerIds =
            getConnectedProducerIds producerIds connectedNodeIds
    in
        Set.isEmpty connectedProducerIds


getAffectedNodeIdsForNetwork : Graph -> Identifier -> Set Identifier
getAffectedNodeIdsForNetwork graph parameterId =
    let
        consumerRole =
            { network = parameterId, role = Consumer }

        producerRole =
            { network = parameterId, role = Producer }

        consumerIds =
            Set.fromList <| List.map .id <| List.filter (\node -> List.member consumerRole node.roles) graph.nodes

        producerIds =
            Set.fromList <| List.map .id <| List.filter (\node -> List.member producerRole node.roles) graph.nodes

        subgraph =
            getSubGraphForNetwork parameterId graph
    in
        Set.filter (isNodeNotConnectedToAProducer subgraph.edges producerIds) consumerIds


type alias ElementWithState a =
    { a | state : ElementState, id : Identifier }


extractKoIds : List (ElementWithState a) -> Set Identifier
extractKoIds elements =
    Set.fromList <| List.map .id (List.filter (\element -> element.state == HS) elements)


extractNotKO : List (ElementWithState a) -> List (ElementWithState a)
extractNotKO elements =
    List.filter (\element -> element.state /= HS) elements


getKoElementIds : List Node -> List Edge -> Set Identifier
getKoElementIds nodes edges =
    Set.union (extractKoIds nodes) (extractKoIds edges)


findAffectedEdgesFromAffectedNodes : List Edge -> Set Identifier -> Set Identifier
findAffectedEdgesFromAffectedNodes edges affectedNodeIds =
    let
        isAffected : Set Identifier -> Edge -> Bool
        isAffected nodeIds edge =
            (Set.member edge.source nodeIds) && (Set.member edge.target nodeIds)
    in
        Set.fromList <| List.map .id <| List.filter (isAffected affectedNodeIds) edges


isConnectedToAKoNode : Set Identifier -> Edge -> Bool
isConnectedToAKoNode koNodeIds edge =
    (Set.member edge.target koNodeIds) || (Set.member edge.source koNodeIds)


removeDisconnectedLinks : Set Identifier -> List Edge -> List Edge
removeDisconnectedLinks koNodeIds edges =
    List.filter (\edge -> not (isConnectedToAKoNode koNodeIds edge)) edges


getStateSummary : List Node -> List Edge -> List Identifier -> { ko : Set Identifier, affected : Set Identifier }
getStateSummary nodes edges networkIds =
    let
        koNodeIds : Set Identifier
        koNodeIds =
            extractKoIds nodes

        koEdgeIds : Set Identifier
        koEdgeIds =
            extractKoIds edges

        remainingGraph : Graph
        remainingGraph =
            { nodes = extractNotKO nodes
            , edges = removeDisconnectedLinks koNodeIds (extractNotKO edges)
            }

        affectedNodeIds : Set Identifier
        affectedNodeIds =
            List.foldl Set.union Set.empty <|
                List.map (getAffectedNodeIdsForNetwork remainingGraph) networkIds

        affectedEdgeIds : Set Identifier
        affectedEdgeIds =
            findAffectedEdgesFromAffectedNodes edges (Set.union koNodeIds affectedNodeIds)
    in
        { ko = (Set.union koNodeIds koEdgeIds)
        , affected = (Set.union affectedNodeIds affectedEdgeIds)
        }


setEdgeHighLight : { ko : Set Identifier, affected : Set Identifier } -> Edge -> Edge
setEdgeHighLight stateSummary edge =
    if Set.member edge.id stateSummary.affected then
        { edge | highLighted = 4 }
    else
        { edge | highLighted = 0 }


setNodeHighLight : { ko : Set Identifier, affected : Set Identifier } -> Node -> Node
setNodeHighLight stateSummary node =
    if Set.member node.id stateSummary.affected then
        { node | highLighted = 3 }
    else
        { node | highLighted = 0 }


propagation : Model -> Model
propagation model =
    propagationWithNetwork model <| Set.toList model.selectedParameters


propagationWithNetwork : Model -> List Identifier -> Model
propagationWithNetwork model parameterIds =
    let
        stateSummary =
            getStateSummary model.nodes model.edges parameterIds

        edges =
            List.map (setEdgeHighLight stateSummary) model.edges

        nodes =
            List.map (setNodeHighLight stateSummary) model.nodes
    in
        { model | nodes = nodes, edges = edges }


propagationWithoutNetwork : Model -> Model
propagationWithoutNetwork model =
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

        outAndHSNodeIds =
            outpoweredNodesIds ++ List.map (\x -> x.id) hsNodes

        initialEdgeList =
            List.map (\x -> { x | highLighted = 0 }) model.edges

        newEdgeList =
            findOutpoweredEdges initialEdgeList outAndHSNodeIds
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
