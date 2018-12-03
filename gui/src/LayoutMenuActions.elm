module LayoutMenuActions
    exposing
        ( -- subLayout
          -- , dropDown
          -- , blur
          layoutPicked
        )

import LayoutMenu
    exposing
        ( Model
          -- , OpenDropDown
        )


-- subLayout : Model -> Sub Messages.Msg
-- subLayout model =
--     case model.openDropDown of
--         LayoutMenu.AllClosed ->
--             Sub.none
--
--         _ ->
--             Mouse.clicks (always Messages.Blur)
--
--
-- dropDown : OpenDropDown -> Model -> Model
-- dropDown openDropDown model =
--     let
--         newOpenDropDown =
--             if model.openDropDown == openDropDown then
--                 LayoutMenu.AllClosed
--             else
--                 openDropDown
--     in
--         { model
--             | openDropDown = newOpenDropDown
--         }
--
--
-- blur : Model -> Model
-- blur model =
--     { model
--         | openDropDown = LayoutMenu.AllClosed
-- }


layoutPicked : String -> Model -> Model
layoutPicked s model =
    let
        newLayout =
            -- if model.layout == Just s then
            --     Nothing
            -- else
            Just s
    in
        { model
            | layout =
                newLayout
                -- , openDropDown = LayoutMenu.AllClosed
        }
