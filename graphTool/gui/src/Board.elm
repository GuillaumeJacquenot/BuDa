module Board
    exposing
        ( displayAll
        , displayFlat
        , displayPbs
        , displayBubble
        , displayGeometry
        )

import Identifier exposing (Identifier)
import DataModel
import ModelManagement
import Node
import Geometries
import Model
import ModelActions
import DataModelActions
import LinkToJS exposing (JsData, makeJsData, msg2js)
import DataModelEncoders exposing (encodeModel)
import Messages exposing (Msg)


formatDisplayBubbleMessage : Model.Model -> JsData
formatDisplayBubbleMessage model =
    LinkToJS.makeJsData "display-bubble" <|
        (DataModelEncoders.encodeModel (showAllDataLight (showBubbles model)).dataModel)


formatDisplayPbsMessage : Model.Model -> JsData
formatDisplayPbsMessage model =
    LinkToJS.makeJsData "display-pbs" <|
        DataModelEncoders.encodeModel (showPBS model)


formatDisplayAllMessage : Model.Model -> JsData
formatDisplayAllMessage model =
    LinkToJS.makeJsData "display-all" <|
        DataModelEncoders.encodeModel (showAllData model).dataModel


formatDisplayFlatMessage : Model.Model -> JsData
formatDisplayFlatMessage model =
    LinkToJS.makeJsData "display-flat" <|
        DataModelEncoders.encodeModel (showAllDataLight model).dataModel


formatDisplayGeometryMessage : Model.Model -> JsData
formatDisplayGeometryMessage model =
    LinkToJS.makeJsData "display-geometry" <|
        DataModelEncoders.encodeModel (showGeometry model).dataModel


displayBubble : Model.Model -> Cmd Msg
displayBubble model =
    LinkToJS.msg2js <| formatDisplayBubbleMessage model


displayPbs : Model.Model -> Cmd Msg
displayPbs model =
    LinkToJS.msg2js <| formatDisplayPbsMessage model


displayAll : Model.Model -> Cmd Msg
displayAll model =
    LinkToJS.msg2js <| formatDisplayAllMessage model


displayFlat : Model.Model -> Cmd Msg
displayFlat model =
    LinkToJS.msg2js <| formatDisplayFlatMessage model


displayGeometry : Model.Model -> Cmd Msg
displayGeometry model =
    LinkToJS.msg2js <| formatDisplayGeometryMessage model


getPBSView : DataModel.Model -> DataModel.Model
getPBSView model =
    ModelManagement.listNodeToPBS model.nodes


getBubblesViewFromNodeId : DataModel.Model -> Identifier -> DataModel.Model
getBubblesViewFromNodeId model id =
    ModelManagement.subBubblesModelFromId model id


getBubblesView : DataModel.Model -> DataModel.Model
getBubblesView model =
    ModelManagement.subBubblesFromUniverse model


getBubblesViewFromNodeName : DataModel.Model -> String -> DataModel.Model
getBubblesViewFromNodeName model s =
    ModelManagement.subBubblesModelFromName model s


getPBSViewFromNodeId : DataModel.Model -> Identifier -> DataModel.Model
getPBSViewFromNodeId model id =
    ModelManagement.listNodeToPBSFromNodeId model.nodes id


getPBSViewFromNodeName : DataModel.Model -> String -> DataModel.Model
getPBSViewFromNodeName model s =
    ModelManagement.listNodeToPBSFromNodeName model.nodes s


getGeometryView : DataModel.Model -> Maybe Identifier -> DataModel.Model
getGeometryView model m_id =
    case m_id of
        Just id ->
            getGeometryViewFromId_ { model | geometryImage = (Geometries.getImageFromId id model.geometries) } id

        Nothing ->
            getAllGeometries_ { model | geometryImage = Nothing }


getAllGeometries_ : DataModel.Model -> DataModel.Model
getAllGeometries_ model =
    let
        newNodes =
            List.filter (\x -> not (x.geometry == Nothing)) model.nodes

        newEdges =
            List.filter
                (\x ->
                    (DataModel.isNodeIdPresent x.source newNodes)
                        && (DataModel.isNodeIdPresent x.target newNodes)
                )
                model.edges
    in
        { model | nodes = newNodes, edges = newEdges }


getGeometryViewFromId_ : DataModel.Model -> Identifier -> DataModel.Model
getGeometryViewFromId_ model id =
    let
        newNodes =
            List.filter (\x -> Node.hasGeometry id x) model.nodes

        newEdges =
            List.filter
                (\x ->
                    let
                        ( m_s, m_t ) =
                            ( DataModel.getNodeFromId x.source model.nodes, DataModel.getNodeFromId x.target model.nodes )

                        res =
                            case ( m_s, m_t ) of
                                ( Just ns, Just nt ) ->
                                    (Node.hasGeometry id ns) && (Node.hasGeometry id nt)

                                _ ->
                                    False
                    in
                        res
                )
                model.edges
    in
        { model | nodes = newNodes, edges = newEdges }


showPBS : Model.Model -> DataModel.Model
showPBS model =
    let
        subModel =
            case model.nodeViewId of
                Nothing ->
                    (getPBSView model.dataModel)

                Just x ->
                    (getPBSViewFromNodeId model.dataModel x)
    in
        subModel


showAllDataLight : Model.Model -> Model.Model
showAllDataLight model =
    modelDataShowAllDataLight_ (updateNodesPositionForLayout_ model)


showAllData : Model.Model -> Model.Model
showAllData model =
    modelShowAllData_ (updateNodesPositionForLayout_ model)


showBubbles : Model.Model -> Model.Model
showBubbles model =
    modelShowBubbles_ (updateNodesPositionForLayout_ model)


showGeometry : Model.Model -> Model.Model
showGeometry model =
    modelShowGeometry_ (updateNodesPositionForLayout_ model)


modelShowGeometry_ : Model.Model -> Model.Model
modelShowGeometry_ model =
    let
        dm =
            (getGeometryView model.dataModel model.geometryId)

        dm2 =
            (DataModel.triNodes dm)
    in
        { model | dataModel = dm2 }


modelShowBubbles_ : Model.Model -> Model.Model
modelShowBubbles_ model =
    let
        m1 =
            ModelManagement.filterWithMask model.dataModel

        subModel =
            case model.nodeViewId of
                Nothing ->
                    (getBubblesView m1)

                Just x ->
                    (getBubblesViewFromNodeId m1 x)

        m2 =
            (DataModel.triNodes subModel)
    in
        { model | dataModel = m2 }


modelShowAllData_ : Model.Model -> Model.Model
modelShowAllData_ model =
    let
        subModel =
            model.dataModel

        m2 =
            case subModel.mustLayout of
                True ->
                    subModel

                False ->
                    DataModel.triNodes subModel
    in
        { model | dataModel = m2 }


modelDataShowAllDataLight_ : Model.Model -> Model.Model
modelDataShowAllDataLight_ model =
    let
        subModel =
            model.dataModel

        -- on garde les liens de plus bas niveau
        lowestEdges =
            DataModelActions.lowestLevelEdges model.dataModel

        m2 =
            { subModel | edges = lowestEdges }

        m3 =
            case subModel.mustLayout of
                True ->
                    m2

                False ->
                    DataModel.triNodes m2
    in
        { model | dataModel = m3 }


updateNodesPositionForLayout_ : Model.Model -> Model.Model
updateNodesPositionForLayout_ model =
    let
        dataModel =
            model.dataModel

        newDatamodel =
            { dataModel | mustLayout = True }

        m0 =
            { model | dataModel = newDatamodel }

        m1 =
            (ModelActions.updateNodesPosition m0)
    in
        m1
