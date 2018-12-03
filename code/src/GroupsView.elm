module GroupsView exposing (view)

import Html exposing (Html, Attribute, button, div, fieldset, input, label, span, text, section)
import Html.Attributes exposing (id, name, style, type_, checked, value, placeholder, class)
import Html.Events exposing (onClick, onCheck, on, onInput)
import Model exposing (Model)
import Messages
import DataModel
import Node exposing (Node)


viewDetail_ : Model -> Html Messages.Msg
viewDetail_ model =
    case model.showFunctionalChain of
        False ->
            div [] []

        True ->
            div []
                [ Html.hr [] []
                , div [ id "functionalChainView" ] [ expose model ]
                , button [ onClick Messages.CreateGroup, id "createGroup", value "createGroup" ] [ text "+" ]
                , button [ onClick Messages.DeleteGroup, id "deleteGroup", value "deleteGroup" ] [ text "-" ]
                ]


view : Model -> Html Messages.Msg
view model =
    div
        [ id "groups", class "vItem", style [ ( "text-align", "center" ) ] ]
        [ button
            [ class "btn btn-primary"
            , id "btnGroups"
            , onClick Messages.ShowHideFunctionalChain
            ]
            [ text "Functional Chain" ]
          -- text "Functional Chain"
        , viewDetail_ model
        ]


expose : Model -> Html Messages.Msg
expose model =
    let
        m_id =
            case model.selection of
                x :: xs ->
                    Just x

                [] ->
                    Nothing

        m_node =
            case m_id of
                Nothing ->
                    Nothing

                Just x ->
                    DataModel.getNodeFromId x model.dataModel.nodes
    in
        exposeList_ m_node (makeKeyValueList m_node model)


checkbox : Bool -> msg -> String -> Html msg
checkbox b msg name =
    div
        [ id "checkbox"
        , style
            [ ( "padding", "10px" )
            , ( "text-align", "left" )
            ]
        ]
        [ label []
            [ input
                [ type_ "checkbox"
                , onClick msg
                , checked b
                ]
                []
            , text name
            ]
        ]


fluxLine_ : Node -> ( String, Bool ) -> Html Messages.Msg
fluxLine_ n ( key, b ) =
    div []
        [ checkbox b
            (Messages.CheckNodeGroupProperty n key)
            -- Messages.NoOp
            key
        ]


highLightLine_ : ( String, Bool ) -> Html Messages.Msg
highLightLine_ ( key, b ) =
    div []
        [ checkbox b
            (Messages.HighLightGroup key)
            -- Messages.NoOp
            key
        ]


exposeList_ : Maybe Node -> List ( String, Bool ) -> Html Messages.Msg
exposeList_ m_node list =
    case m_node of
        Nothing ->
            -- div [] []
            case list of
                [] ->
                    div [] []

                x :: xs ->
                    div []
                        [ highLightLine_ x
                        , exposeList_ m_node xs
                        ]

        Just n ->
            case list of
                [] ->
                    div [] []

                x :: xs ->
                    div []
                        [ fluxLine_ n x
                        , exposeList_ m_node xs
                        ]


makeKeyValueList : Maybe Node -> Model -> List ( String, Bool )
makeKeyValueList m_node model =
    case m_node of
        Nothing ->
            List.map
                (\x ->
                    ( x.name
                    , case model.dataModel.lightedGroup of
                        Nothing ->
                            False

                        Just id ->
                            (x.id == id)
                    )
                )
                model.dataModel.groups

        Just node ->
            List.map (\x -> ( x.name, Node.inGroup x.id node )) model.dataModel.groups
