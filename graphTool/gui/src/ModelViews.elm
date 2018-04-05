module ModelViews
    exposing
        ( getPBSView
        , getBullesViewFromNodeId
        , getBullesView
        , getPBSViewFromNodeId
        , getPBSViewFromNodeName
        , getGeometryView
        , showAllDataLight
        , showAllData
        , showPBS
        , showBulles
        , showGeometry
        )

import Identifier exposing (Identifier)
import DataModel
import ModelManagement
import Node
import Geometries
import Model
import ModelActions
import DataModelActions


getPBSView : DataModel.Model -> DataModel.Model
getPBSView model =
    ModelManagement.listNodeToPBS model.nodes


getBullesViewFromNodeId : DataModel.Model -> Identifier -> DataModel.Model
getBullesViewFromNodeId model id =
    ModelManagement.subBullesModelFromId model id


getBullesView : DataModel.Model -> DataModel.Model
getBullesView model =
    ModelManagement.subBullesFromUniverse model


getBullesViewFromNodeName : DataModel.Model -> String -> DataModel.Model
getBullesViewFromNodeName model s =
    ModelManagement.subBullesModelFromName model s


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


showBulles : Model.Model -> Model.Model
showBulles model =
    modelShowBulles_ (updateNodesPositionForLayout_ model)


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


modelShowBulles_ : Model.Model -> Model.Model
modelShowBulles_ model =
    let
        m1 =
            ModelManagement.filterWithMask model.dataModel

        subModel =
            case model.nodeViewId of
                Nothing ->
                    (getBullesView m1)

                Just x ->
                    (getBullesViewFromNodeId m1 x)

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
