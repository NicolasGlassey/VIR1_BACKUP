# README

# Dev Team Backup and Archive

## Installation

Pré-requis :

* npm 8.3.0 ou ultérieure
* node 16.10.0 ou ultérieure

## Réaliser/Supprimer une AMI (image d'une instance)
## Réaliser/Supprimer un snasphot d'un volume

Votre équipe de développement aura pour objectifs d'archiver une infrastructure existante, aussi bien pour des raisons légales que pratiques.

Exemple de fonctionnalités à développer:

- Archiver toutes les instances d'un vpc.
- Extraire les images pour un import dans vm ware.
- Réaliser une rotation de backup (au-delà d'une durée, supprimer le backup).
- Supprimer un vpc entier.