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


loadCsvModel : String -> DataModel.Model -> DataModel.Model
loadCsvModel s model =
    testAddCsvToModel (List.map (\x -> stringToCsvLine x) (String.lines s)) model


testAddCsvToModel : List CsvLine -> DataModel.Model -> DataModel.Model
testAddCsvToModel list model =
    let
        l1 =
            List.filter (\x -> isValidLineForBloc_ x) list

        m1 =
            List.foldr (\x -> addBlocToModel_ x.name x.parent) model l1

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
                            in
                                m3

                _ ->
                    model
    in
        m1


addBlocToModel_ : String -> String -> DataModel.Model -> DataModel.Model
addBlocToModel_ name sparent model =
    case String.isEmpty sparent of
        True ->
            addSecondBlocToModel_ Nothing name model

        -- root node
        False ->
            case DataModel.isNamePresent sparent model.nodes of
                True ->
                    let
                        m_p =
                            DataModel.getNodeIdFromName sparent model.nodes

                        m =
                            addSecondBlocToModel_ m_p name model
                    in
                        m

                False ->
                    let
                        m1 =
                            DataModelActions.createNode sparent Nothing model

                        m_p =
                            DataModel.getNodeIdFromName sparent m1.nodes

                        m =
                            addSecondBlocToModel_ m_p name m1
                    in
                        m


addSecondBlocToModel_ : Maybe Identifier -> String -> DataModel.Model -> DataModel.Model
addSecondBlocToModel_ m_p s model =
    case (DataModel.getNodeFromNameAndParent s m_p model.nodes) of
        Nothing ->
            (DataModelActions.createNode s m_p model)

        Just n ->
            model
