module ModelWithUndo exposing (Msg(..), Model, defaultModel)

import Messages exposing (Msg(..))
import Model


type Msg
    = ActionMsg Messages.Msg
    | Undo


type alias Model =
    { model : Model.Model
    , undoModel : Model.Model
    }


defaultModel : Model
defaultModel =
    { model = Model.defaultModel
    , undoModel = Model.defaultModel
    }
