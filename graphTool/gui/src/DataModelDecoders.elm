module DataModelDecoders
    exposing
        ( decodeNode
        , decodeEdge
        , decodeIdentifier
        , decodeDataModel
        , decodeNodesPosition
        , decodeGeometryProperty
        )

import Identifier exposing (Identifier)
import Attribut exposing (Attribut)
import ElementAttributes exposing (..)
import Node exposing (Node)
import Link exposing (Edge)
import DataModel
import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (required, optional, hardcoded)
import Json.Decode.Extra
import LinkParameters
import Groups
import Set
import Position exposing (Position)
import Layout exposing (NodeLayout)
import Geometries


decodeIdentifier : Json.Decode.Decoder Identifier
decodeIdentifier =
    Json.Decode.int


decodeAttribut : Json.Decode.Decoder Attribut
decodeAttribut =
    Json.Decode.string


decodePosition : Json.Decode.Decoder Position
decodePosition =
    Json.Decode.Pipeline.decode Position
        |> required "x" Json.Decode.float
        |> required "y" Json.Decode.float


decodeNodeType : Json.Decode.Decoder ElementType
decodeNodeType =
    Json.Decode.map strToNodeType Json.Decode.string


decodeState : Json.Decode.Decoder ElementState
decodeState =
    Json.Decode.map strToState Json.Decode.string



{--decodeState : Json.Decode.Decoder ElementState
decodeState =
    let
        elemState =
            Json.Decode.string
    in
        case elemState of
            "OK" ->
                OK

            "NOK" ->
                NOK

            _ ->
                StateUnknown--}


strToNodeType : String -> ElementType
strToNodeType elemType =
    case elemType of
        "producer" ->
            Producer

        "consumer" ->
            Consumer

        "producer_consumer" ->
            ProducerConsumer

        _ ->
            TypeUnknown


strToState : String -> ElementState
strToState state =
    case state of
        "RAS" ->
            RAS

        "HS" ->
            HS

        _ ->
            StateUnknown


decodeNode : Json.Decode.Decoder Node
decodeNode =
    Json.Decode.Pipeline.decode Node
        |> required "id" decodeIdentifier
        |> required "name" Json.Decode.string
        |> required "parent" (Json.Decode.maybe decodeIdentifier)
        |> required "attribut" (Json.Decode.maybe decodeAttribut)
        |> optional "nodeType" (decodeNodeType) TypeUnknown
        |> optional "state" decodeState StateUnknown
        |> optional "geometry" (Json.Decode.maybe decodeIdentifier) Nothing
        |> required "group" (Json.Decode.Extra.set decodeIdentifier)
        |> hardcoded 0
        |> optional "position" decodePosition Position.defaultPosition
        |> hardcoded False


decodeDataNode : Json.Decode.Decoder DataModel.DataNode
decodeDataNode =
    Json.Decode.Pipeline.decode DataModel.DataNode
        |> required "data" decodeNode


decodeNodes : Json.Decode.Decoder (List DataModel.DataNode)
decodeNodes =
    Json.Decode.list decodeDataNode


decodeActiveProperties : Json.Decode.Decoder Link.ActivePoperties
decodeActiveProperties =
    -- (Set.fromList (Json.Decode.list decodeIdentifier))
    (Json.Decode.Extra.set decodeIdentifier)


decodeEdge : Json.Decode.Decoder Edge
decodeEdge =
    Json.Decode.Pipeline.decode Edge
        |> required "id" decodeIdentifier
        |> required "source" decodeIdentifier
        |> required "target" decodeIdentifier
        |> required "parameters" (Json.Decode.Extra.set decodeIdentifier)
        |> optional "state" decodeState StateUnknown
        |> required "attribut" (Json.Decode.maybe decodeAttribut)
        |> hardcoded 0
        |> optional "tightness" (Json.Decode.Extra.set decodeIdentifier) Set.empty


decodeDataEdge : Json.Decode.Decoder DataModel.DataEdge
decodeDataEdge =
    Json.Decode.Pipeline.decode DataModel.DataEdge
        |> required "data" decodeEdge


decodeEdges : Json.Decode.Decoder (List DataModel.DataEdge)
decodeEdges =
    Json.Decode.list decodeDataEdge


decodeProperty : Json.Decode.Decoder LinkParameters.Property
decodeProperty =
    Json.Decode.Pipeline.decode LinkParameters.Property
        |> required "id" decodeIdentifier
        |> required "name" Json.Decode.string


decodeParameters : Json.Decode.Decoder LinkParameters.Model
decodeParameters =
    Json.Decode.list decodeProperty


decodeGroupProperty : Json.Decode.Decoder Groups.Property
decodeGroupProperty =
    Json.Decode.Pipeline.decode Groups.Property
        |> required "id" decodeIdentifier
        |> required "name" Json.Decode.string


decodeGroups : Json.Decode.Decoder Groups.Model
decodeGroups =
    Json.Decode.list decodeGroupProperty


decodeGeometryProperty : Json.Decode.Decoder Geometries.Property
decodeGeometryProperty =
    Json.Decode.Pipeline.decode Geometries.Property
        |> required "id" decodeIdentifier
        |> required "name" Json.Decode.string
        |> optional "svg" (Json.Decode.maybe Json.Decode.string) Nothing


decodeGeometries : Json.Decode.Decoder Geometries.Model
decodeGeometries =
    Json.Decode.list decodeGeometryProperty


decodeLayout : Json.Decode.Decoder (List Position.NodePosition)
decodeLayout =
    Json.Decode.list decodeNodePosition


decodeNodeLayout : Json.Decode.Decoder Layout.NodeLayout
decodeNodeLayout =
    Json.Decode.Pipeline.decode Layout.NodeLayout
        |> required "id" decodeIdentifier
        |> required "layout" decodeLayout


decodeGeometryLayout : Json.Decode.Decoder Layout.GeometryLayout
decodeGeometryLayout =
    Json.Decode.Pipeline.decode Layout.GeometryLayout
        |> required "id" decodeIdentifier
        |> required "layout" decodeLayout


decodeDataModel : Json.Decode.Decoder DataModel.DataModel
decodeDataModel =
    Json.Decode.Pipeline.decode DataModel.DataModel
        |> required "nodes" decodeNodes
        |> required "edges" decodeEdges
        |> required "parameters" decodeParameters
        |> required "groups" decodeGroups
        |> optional "geometries" decodeGeometries []
        |> optional "lightedGroup" (Json.Decode.maybe Json.Decode.int) Nothing
        |> optional "lightedGeometry" (Json.Decode.maybe Json.Decode.int) Nothing
        |> optional "selectedParameters" (Json.Decode.Extra.set decodeIdentifier) Set.empty
        |> optional "layouts" (Json.Decode.list decodeNodeLayout) []
        |> optional "geometryLayouts" (Json.Decode.list decodeGeometryLayout) []
        |> optional "lightLayout" (Json.Decode.maybe decodeLayout) Nothing
        |> optional "rootBubbleLayout" (Json.Decode.maybe decodeLayout) Nothing
        |> optional "mask" (Json.Decode.Extra.set decodeIdentifier) Set.empty
        |> optional "geometryImage" (Json.Decode.maybe Json.Decode.string) Nothing


decodeNodePosition : Json.Decode.Decoder Position.NodePosition
decodeNodePosition =
    Json.Decode.Pipeline.decode Position.NodePosition
        |> required "id" decodeIdentifier
        |> required "position" decodePosition


decodeNodesPosition : Json.Decode.Decoder (List Position.NodePosition)
decodeNodesPosition =
    Json.Decode.list decodeNodePosition
