module Verification exposing (verification, verificationBlocs)

import Identifier exposing (Identifier)
import DataModel exposing (Model)
import Link exposing (Edge)
import ModelManagement


verification : Model -> Model
verification model =
    filterLinkNodeWithAscendant_ model


verificationBlocs : Model -> Model
verificationBlocs model =
    verifUnicityIdBloc_ model



-- verification blocs. existe t-il des blocs avec même id ?
-- si oui, on le signale en log
-- on cherche le max id du model : getCurIdFromModel
-- pour i = 0 a maxId, trouver la liste blocs(id=i). La taille de la liste doit etre < 2


unicityBlocId_ : Identifier -> Model -> Model
unicityBlocId_ id model =
    let
        list =
            List.filter (\x -> (x.id == id)) model.nodes

        msg =
            case (List.length list) > 1 of
                True ->
                    "Error doublons pour id " ++ (toString id)

                False ->
                    ""

        z =
            case String.isEmpty msg of
                True ->
                    ""

                False ->
                    Debug.log "unicityBlocId_ " msg
    in
        model


unicityBlocListId_ : List Identifier -> Model -> Model
unicityBlocListId_ list model =
    case list of
        [] ->
            model

        x :: xs ->
            unicityBlocListId_ xs (unicityBlocId_ x model)


mk_ : Identifier -> Identifier -> List Identifier -> List Identifier
mk_ maxId i l =
    case i > maxId of
        True ->
            l

        False ->
            mk_ maxId (i + 1) (i :: l)


mkListId : Identifier -> List Identifier
mkListId maxId =
    let
        list =
            mk_ maxId 0 []

        z =
            Debug.log "mkListId " ( maxId, list )
    in
        list


verifUnicityIdBloc_ : Model -> Model
verifUnicityIdBloc_ model =
    let
        maxId =
            DataModel.getCurIdFromModel model

        z =
            Debug.log "getCurIdFromModel" maxId

        list =
            mkListId maxId

        m1 =
            unicityBlocListId_ list model
    in
        m1



-- verification des liens du modele
-- 1. on supprime les liens entre n et ascendant(n)


filterLinkNodeWithAscendant_ : Model -> Model
filterLinkNodeWithAscendant_ model =
    let
        filterEdges =
            List.filter
                (\x ->
                    not (isLinkNodeWithAscendant_ x model)
                )
                model.edges
    in
        { model | edges = filterEdges }


isLinkNodeWithAscendant_ : Edge -> Model -> Bool
isLinkNodeWithAscendant_ edge model =
    -- on teste si (src est ascendant de target) ou si (target est ascendant de src)
    let
        m_nsrc =
            DataModel.getNodeFromId edge.source model.nodes

        m_ntarget =
            DataModel.getNodeFromId edge.target model.nodes

        b =
            case ( m_nsrc, m_ntarget ) of
                ( Just nsrc, Just ntarget ) ->
                    let
                        src_ascendants =
                            ModelManagement.getAscendants model.nodes nsrc Nothing

                        target_ascendants =
                            ModelManagement.getAscendants model.nodes ntarget Nothing

                        b1 =
                            (List.member nsrc target_ascendants) || (List.member ntarget src_ascendants)

                        z =
                            if b1 == True then
                                Debug.log "delete link" [ ( nsrc, ntarget ) ]
                            else
                                []
                    in
                        b1

                _ ->
                    False
    in
        b
