![](doc/images/BuDa_GitHub_Logo.png)
# BuDa - Intuitive system mapping

[![License](https://img.shields.io/badge/License-EPL%202.0-blue.svg)](https://opensource.org/licenses/EPL-2.0)

## General purpose

BuDa is a Proof-Of-Concept for generic systems-mapping tools. BuDa enables
interface management across several levels, from the individual part to the
system assembly as a whole. BuDa is the perfect companion for the designers of
large, heavily interconnected systems.

## What BuDa may be used for

The multi-level connectivity graphs that are supported by BuDa are extremely
generic. These are some of the use cases we have come across some far:
- **industrial system mapping**: industrial systems are made of many, many
    parts organized as subsystems embedded in larger subsystems and eventually
    forming the system itself. These parts are connected one to the other with
    cables, piping, shafts, etc. BuDa offers reliable support in the management
    of all these system interfaces.
- **fault propagation analysis**: BuDa offers some features to track fault
    propagation through the connectivity graph of industrial systems, for
    safety, dependability, cyber-security robustness analyses.
- **interface management during system assembly**: the basic parts of the
    system may also be viewed as low-level manufacturing blocks in the
    manufacturing breakdown structure (MBS). In one glimpse, BuDa provides the
    exhaustive list of the interfaces between any assembly at any level in the
    MBS, and the rest of the world.
- **enhanced system modularity**: with BuDa, it is easy to asses the impact of
    adding, removing or replacing any portion of a system.
- **business environments** might also be mapped with BuDa, with links between
    people being aggregated at higher levels (entity, organization, company,
    etc.).

We can't wait to hear from your experience with multi-level connectivity
graphs!

# More about BuDa

## System mapping with BuDa

BuDa is the contraction of **Bu**bble **D**i**a**gram, after the ellipsoïdal
shape of the block objects in the first draft of the tool. Just like these
so-familiar back-of-the-envelope system architecture sketches.

In BuDa, a system is modelled as a set of blocks and links between these
blocks. BuDa supports multi-level system modelling: blocks can have "parent" or
"children" blocks, thus forming a hierarchical structure of blocks identical to
standard breakdown structures (PBS, WBS, and the like).

The major advantage of BuDa lies in the management of links within multi-level
architectures. Links are supported at any levels in the blocks' hierarchy;
links between blocks at different levels are supported; links that have been
specified at lower levels in the model trigger the automatic generation of
links at higher levels.

The blocks and the links taken together form two entangled graphs that share
the same nodes:
- one graph is the blocks' "**Breakdown Structure**"; its nodes are the blocks,
    and its edges are the parent-children relationships between the blocks,
- one graph is the **multi-level connectivity graph** of the system; its nodes
    are the blocks, and its edges are the "links" specified by the User or
    generated automatically by BuDa. 

Both graphs evolve together - for instance, moving one block will have an
impact on the links of the block. Don't worry, though! the overall consistency
of the multi-level connectivity graph is taken care of by BuDa, thanks to the
carefully crafted procedures that are used to generate, delete, move, copy /
paste blocks and links.

## Where do I start?

The "getting started" section below will help you in your first steps with
BuDa.

## Copyright

The tool has been developed by [SIREHNA](http://www.sirehna.com/), in
collaboration with [Naval Group](https://www.naval-group.com/en/), [IRT
SystemX](https://www.irt-systemx.fr/en/) and [Bureau
Veritas](https://www.bureauveritas.fr/). SIREHNA owns the copyright for all the
developments related to BuDa at the date of its first public release on GitHub.

The original development team comprised Michel Picard (dev) & Alan Guegan
(product lead), both from SIREHNA. The development was fuelled by contributions
from Benoît Rafine & Romain Le Nena (Naval Group) and Laurent Descombes and
Hanane Fadiaw (IRT Systemx). The constant and cheerful support from the late
Philippe Corrignan (Bureau Veritas) was greatly appreciated.

## License

BuDa is published under the [Eclipse 2.0 public
license]((https://opensource.org/licenses/EPL-2.0)). For further information,
please refer to the [License file](LICENCE.md) in this repository.

## Funding

BuDa has been developed within a project called HOLISHIP. The HOLISHIP project
has received funding from the European Union's Horizon 2020 research and
innovation programme under grant agreement n° 689074.

## Contributing

BuDa is still under development. All contributions and feedback are warmly
welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to maximize feedback & contribution efficiency when submitting issues & pull requests to BuDa.
Our code of conduct is the [Contributor Covenant](CODE_OF_CONDUCT.md) (original
version available
[here](https://www.contributor-covenant.org/version/1/4/code-of-conduct) ).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/sirehna/BuDa/tags).


## Publications

Here is a short list of publications related to BuDa:
- A. Guegan (1), B. Rafine (2), L. Descombes (3), H. Fadiaw (3), P. Marty (4) and P. Corrignan (4) / (1) SIREHNA, (2) Naval Group, (3) IRT Systemx and (4) Bureau Veritas Marine & Offshore, *A systems engineering approach to ship design*, Proceedings of the 8th International Conference on Complex Systems Design & Management / CSD&M 2017, Paris, France
- P. Corrignan (1), V. Le Diagon (1), N. Li (1), S. Torben (2), M. de Jongh (2), K.E. Holmefjord (2), B. Rafine (3), R. Le Nena (3), A. Guegan (4), L. Sagaspe (5) & X. de Bossoreille (5) / (1) Bureau Veritas Marine & Offshore, (2) Rolls Royce Marine, (3) Naval Group, (4) SIREHNA, (5) APSYS, *System engineering based design for safety and total cost of ownership*, Proceedings of the 13th International Marine Design Conference (IMDC 2018), June 10-14, 2018, Helsinki, Finland

# Getting started with BuDa

See [the documentation](doc/Readme.md).

Work In Progress...

1/ loading latest build

2/ running tool

3/ loading test file

4/ playing around

5/ loading your own model in csv format

6/ building a model from scratch

The following sections provide an overview of the basic features of BuDa, including:
- a general description of the tool and its GUI
- a description of operations on models with BuDa
- a description of the various visualization options with BuDa.
