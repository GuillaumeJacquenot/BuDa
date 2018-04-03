module DataModelEncoders
    exposing
        ( encodeNode
        , encodeEdge
        , encodeMaybeIdentifier
        , encodeModel
        , encodeMetaModel
        , encodeExport
        , encodeMqttMessage
        , encodeMqttMessageNotification
        , encodeMqttMessage_
        , encodeMqttMessageNotification_
        )

import Identifier exposing (Identifier)
import Position exposing (Position)
import Attribut exposing (Attribut)
import Node exposing (Node)
import Link exposing (Edge)
import DataModel
import Json.Encode exposing (Value, array, bool, encode, float, int, list, null, object, string)
import Set exposing (Set)
import LinkParameters
import Groups
import Layout exposing (NodeLayout, GeometryLayout)
import Notification
import Geometries
import Mqtt


encodeMaybeIdentifier : Maybe Identifier -> String
encodeMaybeIdentifier =
    encode 0 << maybe encodeIdentifier


encodeIdentifier : Identifier -> Value
encodeIdentifier identifier =
    Json.Encode.int identifier


encodeAttribut : Attribut -> Value
encodeAttribut attribut =
    Json.Encode.string attribut


maybe : (a -> Json.Encode.Value) -> Maybe a -> Json.Encode.Value
maybe encoder maybeVal =
    case maybeVal of
        Nothing ->
            Json.Encode.null

        Just val ->
            encoder val


encodePosition_ : Position -> Value
encodePosition_ position =
    object
        [ ( "x", Json.Encode.float position.x )
        , ( "y", Json.Encode.float position.y )
        ]


encodeNode_ : Node -> Value
encodeNode_ n =
    object
        [ ( "id", encodeIdentifier n.id )
        , ( "name", Json.Encode.string n.name )
        , ( "parent", maybe encodeIdentifier n.parent )
        , ( "attribut", maybe encodeAttribut n.attribut )
        , ( "geometry", maybe encodeIdentifier n.geometry )
        , ( "group", (Json.Encode.list <| List.map encodeIdentifier (Set.toList n.group)) )
        , ( "highLighted"
          , Json.Encode.int
                (case n.highLighted of
                    True ->
                        1

                    False ->
                        0
                )
          )
        , ( "position", encodePosition_ n.position )
        , ( "blow"
          , Json.Encode.int
                (case n.blow of
                    True ->
                        1

                    False ->
                        0
                )
          )
        ]


encodeNode : Node -> String
encodeNode =
    encode 0 << encodeNode_


encodeNodeData : Node -> Value
encodeNodeData n =
    object
        [ ( "data", encodeNode_ n ) ]


encodeNodes : List Node -> Value
encodeNodes l =
    Json.Encode.list <| List.map encodeNodeData l


encodeEdge_ : Edge -> Value
encodeEdge_ je =
    object
        [ ( "id", encodeIdentifier je.id )
        , ( "source", encodeIdentifier je.source )
        , ( "target", encodeIdentifier je.target )
        , ( "parameters", (Json.Encode.list <| List.map encodeIdentifier (Set.toList je.parameters)) )
        , ( "attribut", maybe encodeAttribut je.attribut )
        , ( "highLighted", Json.Encode.int je.highLighted )
        , ( "tightness", (Json.Encode.list <| List.map encodeIdentifier (Set.toList je.tightness)) )
        ]


encodeEdge : Edge -> String
encodeEdge =
    encode 0 << encodeEdge_


encodeEdgeData : Edge -> Value
encodeEdgeData je =
    object
        [ ( "data", encodeEdge_ je ) ]


encodeEdges : List Edge -> Value
encodeEdges l =
    Json.Encode.list <| List.map encodeEdgeData l


encodeProperty : LinkParameters.Property -> Value
encodeProperty property =
    object
        [ ( "id", encodeIdentifier property.id )
        , ( "name", Json.Encode.string property.name )
        ]


encodeParameters : LinkParameters.Model -> Value
encodeParameters parameters =
    (Json.Encode.list <| List.map encodeProperty parameters)


encodeGroupProperty : Groups.Property -> Value
encodeGroupProperty property =
    object
        [ ( "id", encodeIdentifier property.id )
        , ( "name", Json.Encode.string property.name )
        ]


encodeGroups : Groups.Model -> Value
encodeGroups groups =
    (Json.Encode.list <| List.map encodeGroupProperty groups)


encodeGeometryProperty : Geometries.Property -> Value
encodeGeometryProperty property =
    object
        [ ( "id", encodeIdentifier property.id )
        , ( "name", Json.Encode.string property.name )
        , ( "svg", maybe Json.Encode.string property.svg )
        ]


encodeGeometries : Geometries.Model -> Value
encodeGeometries geometries =
    (Json.Encode.list <| List.map encodeGeometryProperty geometries)


encodeNodePosition : Position.NodePosition -> Value
encodeNodePosition np =
    object
        [ ( "id", encodeIdentifier np.id )
        , ( "position", encodePosition_ np.position )
        ]


encodeNodePositionList : List Position.NodePosition -> Value
encodeNodePositionList list =
    Json.Encode.list <| List.map encodeNodePosition list


encodeNodeLayout : NodeLayout -> Value
encodeNodeLayout nl =
    object
        [ ( "id", encodeIdentifier nl.id )
        , ( "layout", (Json.Encode.list <| List.map encodeNodePosition nl.layout) )
        ]


encodeLayouts : List NodeLayout -> Value
encodeLayouts list =
    (Json.Encode.list <| List.map encodeNodeLayout list)


encodeGeometryLayout : GeometryLayout -> Value
encodeGeometryLayout nl =
    object
        [ ( "id", encodeIdentifier nl.id )
        , ( "layout", (Json.Encode.list <| List.map encodeNodePosition nl.layout) )
        ]


encodeGeometryLayouts : List GeometryLayout -> Value
encodeGeometryLayouts list =
    (Json.Encode.list <| List.map encodeGeometryLayout list)


encodeModel_ : DataModel.Model -> Value
encodeModel_ jsmodel =
    object
        [ ( "nodes", encodeNodes jsmodel.nodes )
        , ( "edges", encodeEdges jsmodel.edges )
        , ( "parameters", encodeParameters jsmodel.parameters )
        , ( "groups", encodeGroups jsmodel.groups )
        , ( "geometries", encodeGeometries jsmodel.geometries )
        , ( "mustLayout", Json.Encode.bool jsmodel.mustLayout )
        , ( "layouts", encodeLayouts jsmodel.layouts )
        , ( "geometryLayouts", encodeGeometryLayouts jsmodel.geometryLayouts )
        , ( "lightLayout", (maybe encodeNodePositionList jsmodel.lightLayout) )
        , ( "rootBubbleLayout", (maybe encodeNodePositionList jsmodel.rootBubbleLayout) )
        , ( "geometryImage", (maybe Json.Encode.string jsmodel.geometryImage) )
        ]


encodeModel : DataModel.Model -> String
encodeModel =
    encode 0 << encodeModel_


encodeMetaModel_ : DataModel.MetaModel -> Value
encodeMetaModel_ meta =
    object
        [ ( "filename", string meta.filename )
        , ( "model", encodeModel_ meta.model )
        ]


encodeMetaModel : DataModel.MetaModel -> String
encodeMetaModel =
    encode 0 << encodeMetaModel_


encodeExport_ : DataModel.ExportLink -> Value
encodeExport_ meta =
    object
        [ ( "filename", string meta.filename )
        , ( "model", string meta.model )
        ]


encodeExport : DataModel.ExportLink -> String
encodeExport =
    encode 0 << encodeExport_


encodeNotificationData_ : Notification.NotificationData -> Json.Encode.Value
encodeNotificationData_ notifdata =
    case notifdata of
        Notification.BLOC n ->
            encodeNode_ n

        Notification.LIEN e ->
            encodeEdge_ e

        Notification.PARAMETER p ->
            encodeProperty p

        Notification.FUNCIONAL_CHAIN fc ->
            encodeGroupProperty fc

        Notification.NULLNOTIFICATION ->
            Json.Encode.null


encodeNotificationModel_ : Notification.Model -> Json.Encode.Value
encodeNotificationModel_ model =
    object
        [ ( "header", Json.Encode.string model.header )
        , ( "data", encodeNotificationData_ model.data )
        ]


encodeConnectionType_ : Mqtt.ConnectionType -> Value
encodeConnectionType_ connectionType =
    Json.Encode.string (Mqtt.connectionType2String connectionType)


encodeMqtt_ : Mqtt.Model -> Value
encodeMqtt_ model =
    object
        [ ( "url", Json.Encode.string model.url )
        , ( "topic", Json.Encode.string model.topic )
        , ( "clientId", Json.Encode.string model.clientId )
        , ( "connectionType", encodeConnectionType_ model.connectionType )
        ]


encodeMqttMessage_ : Mqtt.Model -> Notification.NotificationData -> Value
encodeMqttMessage_ model notifyData =
    object
        [ ( "mqtt", encodeMqtt_ model )
        , ( "message", encodeNotificationData_ notifyData )
        ]


encodeMqttMessageNotification_ : Mqtt.Model -> Notification.Model -> Value
encodeMqttMessageNotification_ mqtt notif =
    object
        [ ( "mqtt", encodeMqtt_ mqtt )
        , ( "message", encodeNotificationModel_ notif )
        ]


encodeMqttMessage : Mqtt.Model -> Notification.NotificationData -> String
encodeMqttMessage model notifyData =
    encode 0 (encodeMqttMessage_ model notifyData)


encodeMqttMessageNotification : Mqtt.Model -> Notification.Model -> String
encodeMqttMessageNotification model notif =
    encode 0 (encodeMqttMessageNotification_ model notif)
