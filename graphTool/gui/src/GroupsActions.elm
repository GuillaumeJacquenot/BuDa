module GroupsActions exposing (addGroupToNode, deleteGroupFromNode, addGroupsToNodes)

import Identifier exposing (Identifier)
import Node exposing (Node)
import DataModel exposing (Model, childs)
import ModelManagement
import Set
import Notification


addGroupsToNodes : List Node -> Model -> Model
addGroupsToNodes list model =
    case list of
        [] ->
            model

        x :: xs ->
            addGroupsToNodes xs (addGroupsToOneNode_ (Set.toList x.group) x model)


addGroupsToOneNode_ : List Identifier -> Node -> Model -> Model
addGroupsToOneNode_ list n model =
    case list of
        [] ->
            model

        x :: xs ->
            addGroupsToOneNode_ xs n (addGroupToNode x n model)



{--
////////////////////////////////////////////////////////////////////////////////
addNodeToGroup
méthode ascendante
////////////////////////////////////////////////////////////////////////////////
--}


addGroupToNode : Identifier -> Node -> Model -> Model
addGroupToNode id n model =
    let
        asc_n =
            ModelManagement.getAscendants model.nodes n Nothing
    in
        addGroupToListNode_ id asc_n model


addGroupToListNode_ : Identifier -> List Node -> Model -> Model
addGroupToListNode_ id list model =
    case list of
        [] ->
            model

        x :: xs ->
            addGroupToListNode_ id xs (addGroupToOneNode_ id x model)


addGroupToOneNode_ : Identifier -> Node -> Model -> Model
addGroupToOneNode_ id n model =
    let
        newNodes =
            List.map
                (\x ->
                    case x.id == n.id of
                        True ->
                            { x | group = Set.insert id x.group }

                        False ->
                            x
                )
                model.nodes

        m_n =
            DataModel.getNodeFromId n.id newNodes

        newNotifications =
            case m_n of
                Nothing ->
                    model.notifications

                Just n1 ->
                    { header = "node.update", data = (Notification.BLOC n1) } :: model.notifications
    in
        { model | nodes = newNodes, notifications = newNotifications }



{--
////////////////////////////////////////////////////////////////////////////////
deleteGroupFromNode
////////////////////////////////////////////////////////////////////////////////
--}


deleteGroupFromNode : Identifier -> Node -> Model -> Model
deleteGroupFromNode id n model =
    let
        asc_n =
            ModelManagement.getAscendants model.nodes n Nothing
    in
        deleteGroupFromListNode_ id asc_n model


deleteGroupFromListNode_ : Identifier -> List Node -> Model -> Model
deleteGroupFromListNode_ id list model =
    case list of
        [] ->
            model

        x :: xs ->
            deleteGroupFromListNode_ id xs (deleteGroupFromOneNode_ id x model)


deleteGroupFromOneNode_ : Identifier -> Node -> Model -> Model
deleteGroupFromOneNode_ id n model =
    case (canDeleteGroupFromNode id n model) of
        False ->
            model

        True ->
            let
                newNodes =
                    List.map
                        (\x ->
                            case x.id == n.id of
                                True ->
                                    { x | group = Set.remove id x.group }

                                False ->
                                    x
                        )
                        model.nodes

                m_n =
                    DataModel.getNodeFromId n.id newNodes

                newNotifications =
                    case m_n of
                        Nothing ->
                            model.notifications

                        Just n1 ->
                            { header = "node.update", data = (Notification.BLOC n1) } :: model.notifications
            in
                { model | nodes = newNodes, notifications = newNotifications }


canDeleteGroupFromNode : Identifier -> Node -> Model -> Bool
canDeleteGroupFromNode id n model =
    let
        childs_ =
            DataModel.childs n model.nodes

        l =
            List.filter (\x -> Set.member id x.group) childs_
    in
        (List.length l == 0)
