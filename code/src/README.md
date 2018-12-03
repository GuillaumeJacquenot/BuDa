# GraphTool

## Implementation Bubble Diagram relativement au node n

  * construction de la liste des enfants de n (nommée childs)
  * creation de la liste des nodes qui ont un lien avec n (nommée others)
  * on filtre la liste others de la façon suivante:
      on conserve un node x si le x.parent == ParentCommun (x,n) ou si x.parent == Nothing
      La liste filtrée est nommée extern

  * la liste des nodes retenues est n + childs + extern (nommée newNodes)

  * création de la liste des liens.
    On filtre la liste des liens du model tels que source et target sont dans newNodes. (nommée newEdges1)
    On filtre la liste newEdges1 avec mainFilter_

      mainFilter_ x =
      * x.source != n et x.target != n -> True
      * x.source == n
            il existe un lien entre x.target et un enfant de n -> False
            sinon -> True
      * x.target == n
            il existe un lien entre x.source et un enfant de n -> False
            sinon -> True

## Creation de lien

Algo de creation de lien entre les nodes n et m

* on recherche le pere commun a (n,m). noté p. p peut valoir Nothing
* on crée la liste des ascendants de n jusqu'a p. notée ln
* on crée la liste des ascendants de m jusqu'a p. notée lm
* on crée tous les liens possibles entre un élément de ln et un élément de lm.

  * ln = [n, pn, ppn, ..., lastpn] ou lastpn est un fils du père commun p
  * lm = [m, pm, ppm, ..., lastpm] ou lastpm est un fils du père commun p
  * Les liens créés sont : n - m, n - pm, n - ppm, ..., m - pn, m - ppn, ..., m - lastpm


  ou pm est le pere de m, ppm est le pere de pm

## Ajout d'un parametre sur un lien

Algo d' ajout de parametre au lien entre les nodes n et m

* on recherche le pere commun a (n,m). noté p. p peut valoir Nothing
* on crée la liste des ascendants de n jusqu'a p. notée ln
* on crée la liste des ascendants de m jusqu'a p. notée lm
* on ajoute le parametre à tous les liens existant entre un élément de ln et un élément de lm.

## Suppression d'un parametre sur un lien

Algo de suppression de parametre au lien entre les nodes n et m

* On supprime le parametre à tous les liens descendant
* On supprime le parametre à tous les liens ascendants si la condition (1) est remplie

(1) : aucun lien bros ne contient la parametre a supprimer

## Suppression d'un parametre dans le model
* on desactive le parametre dans tous les liens du modele
* on supprime le parametre dans la liste des parametres (dataModel.parameters)

## la condition ModelActions.canDelete
* canDelete : Node -> Node -> Model.Model -> Bool
* cette fonction precise si on peut deleter un lien


## Recherche des liens de plus bas niveau
* cette fonctionnalité est implémentée dans la fonction ModelActions.lowestLevelEdges: On filtre la liste des liens avec la condition ModelActions.isLowestLevel
* L'implémenation de isLowestLevel est equivalente à celle de ModelActions.canDelete

## Groupement de plusieurs noeuds
* cette fonctionnalité est implémentée dans DataModelActions.groupNodes.
* Description de l'Algo
  1. si les noeuds de la liste n'ont pas le même père (p0), on ne fait rien
  2. on crée un nouveau noeud (p1) fils du père commun p0. on met à jour les noeuds de la liste pour qu'ils soient enfants de ce nouveau père p1
  3. soit X l'ensemble des targets définies pour les liens dont la source est dans la liste des noeuds. on ajoute tous les liens du type p1 -> x ou x est dans X.
  4. on met à jour les paramètres des nouveaux liens: si l un  lien tel que l.source est dans liste des noeuds. on complète les paramètres du lien p1 -> l.target avec ceux de l.
