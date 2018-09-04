module Csv2 exposing (loadCsvModel)

import Identifier exposing (Identifier)
import DataModel
import DataModelActions


type alias CsvLine =
    { name : String
    , denomination : String
    , parent : String
    , refAboutissant1 : String
    , refAboutissant2 : String
    , parameter : String
    }


defaultCsvLine : CsvLine
defaultCsvLine =
    { name = ""
    , denomination = ""
    , parent = ""
    , refAboutissant1 = ""
    , refAboutissant2 = ""
    , parameter = ""
    }


supprFirstLine : List String -> List String
supprFirstLine list =
    case list of
        [] ->
            []

        x :: xs ->
            xs


loadCsvModel : String -> DataModel.Model -> DataModel.Model
loadCsvModel s model =
    let
        lines =
            supprFirstLine (String.lines s)
    in
        testAddCsvToModel (List.map (\x -> stringToCsvLine x) lines) model


testAddCsvToModel : List CsvLine -> DataModel.Model -> DataModel.Model
testAddCsvToModel list model =
    let
        l1 =
            List.filter (\x -> isValidLineForBloc_ x) list

        m1 =
            List.foldr (\x -> addBlocToModel_ x) model l1

        m2 =
            List.foldr (\x -> addLinkFromCsvLine_ x) m1 list
    in
        m2


cons : List String -> CsvLine
cons list =
    case list of
        x1 :: x2 :: x3 :: x4 :: x5 :: x6 :: xs ->
            { defaultCsvLine
                | name = x1
                , denomination = x2
                , parent = x3
                , refAboutissant1 = x4
                , refAboutissant2 = x5
                , parameter = x6
            }

        _ ->
            defaultCsvLine


stringToCsvLine : String -> CsvLine
stringToCsvLine s =
    let
        list =
            String.split ";" s
    in
        cons list


isValidLineForBloc_ : CsvLine -> Bool
isValidLineForBloc_ csvLine =
    String.isEmpty csvLine.refAboutissant1
        && String.isEmpty csvLine.refAboutissant2
        && isValidName_ csvLine.name


isBlocInModel_ : String -> DataModel.Model -> Bool
isBlocInModel_ s model =
    DataModel.isNamePresent s model.nodes


isValidLineForLink_ : CsvLine -> DataModel.Model -> Bool
isValidLineForLink_ csvLine model =
    let
        b =
            (not (String.isEmpty csvLine.refAboutissant1))
                && (not (String.isEmpty csvLine.refAboutissant2))
                && (not (csvLine.refAboutissant2 == csvLine.refAboutissant1))
                && ((isBlocInModel_ csvLine.refAboutissant1 model))
                && ((isBlocInModel_ csvLine.refAboutissant2 model))
    in
        b


isValidName_ : String -> Bool
isValidName_ s =
    String.length s >= 1


addLinkFromCsvLine_ : CsvLine -> DataModel.Model -> DataModel.Model
addLinkFromCsvLine_ csvLine model =
    case isValidLineForLink_ csvLine model of
        True ->
            addLinkToModel_ csvLine model

        False ->
            model


addLinkToModel_ : CsvLine -> DataModel.Model -> DataModel.Model
addLinkToModel_ csvLine model =
    let
        m_id1 =
            DataModel.getNodeIdFromName csvLine.refAboutissant1 model.nodes

        m_id2 =
            DataModel.getNodeIdFromName csvLine.refAboutissant2 model.nodes

        m1 =
            case ( m_id1, m_id2 ) of
                ( Just id1, Just id2 ) ->
                    case (id1 == id2) of
                        True ->
                            model

                        False ->
                            let
                                m2 =
                                    DataModelActions.createLink id1 id2 model

                                m3 =
                                    case not (String.isEmpty csvLine.parameter) of
                                        True ->
                                            let
                                                m21 =
                                                    DataModelActions.createParameter csvLine.parameter m2

                                                m_edge =
                                                    DataModel.getEdgeFromNodesName csvLine.refAboutissant1 csvLine.refAboutissant2 m21

                                                m22 =
                                                    case m_edge of
                                                        Just edge ->
                                                            DataModelActions.updateProperty edge csvLine.parameter m21

                                                        Nothing ->
                                                            m21
                                            in
                                                m22

                                        False ->
                                            m2

                                m4 =
                                    let
                                        m_edge =
                                            DataModel.getEdgeFromNodesName csvLine.refAboutissant1 csvLine.refAboutissant2 m3

                                        m_id =
                                            case m_edge of
                                                Just edge ->
                                                    Just edge.id

                                                Nothing ->
                                                    Nothing
                                    in
                                        DataModelActions.updateAttribute m_id csvLine.denomination m3
                            in
                                m4

                _ ->
                    model
    in
        m1


addBlocToModel_ : CsvLine -> DataModel.Model -> DataModel.Model
addBlocToModel_ x model =
    let
        name =
            x.name

        sparent =
            x.parent

        attribute =
            x.denomination
    in
        case String.isEmpty sparent of
            True ->
                addSecondBlocToModel_ Nothing name attribute model

            -- root node
            False ->
                case DataModel.isNamePresent sparent model.nodes of
                    True ->
                        let
                            m_p =
                                DataModel.getNodeIdFromName sparent model.nodes

                            m =
                                addSecondBlocToModel_ m_p name attribute model
                        in
                            m

                    False ->
                        let
                            m1 =
                                DataModelActions.createNode sparent Nothing model

                            m_p =
                                DataModel.getNodeIdFromName sparent m1.nodes

                            m =
                                addSecondBlocToModel_ m_p name attribute m1
                        in
                            m


addSecondBlocToModel_ : Maybe Identifier -> String -> String -> DataModel.Model -> DataModel.Model
addSecondBlocToModel_ m_p s attribute model =
    case (DataModel.getNodeFromNameAndParent s m_p model.nodes) of
        Nothing ->
            let
                m1 =
                    DataModelActions.createNode s m_p model

                m_id =
                    DataModel.getNodeIdFromNameAndParent s m_p m1.nodes

                m2 =
                    DataModelActions.updateAttribute m_id attribute m1
            in
                m2

        Just n ->
            model
