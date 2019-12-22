import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AddGameComponent } from './add-game/add-game.component';

export interface User {
  id: number;
  fullname: string;
}

export enum Position {
  Goalkeeper,
  Striker
}

export interface Player {
  userid: number;
  goals: number;
  position: Position;
}

export interface ITeam {
  players: Player[];
}

export class Team implements ITeam {
  players: Player[];

  constructor(players: Player[]) {
    this.players = players;
  }

  get goals() {
    return this.players.reduce((sumGoals, u) => sumGoals + u.goals, 0);
  }
}

export enum WonTeam {
  TeamA,
  TeamB
}

export interface IGame {
  id: number;
  teamA: Team;
  teamB: Team;
}

export class Game implements IGame {
  id: number;
  teamA: Team;
  teamB: Team;

  constructor(params: { teamA: Team, teamB: Team }) {
    this.teamA = params.teamA;
    this.teamB = params.teamB;
  }

  get wonTeam(): WonTeam {
    return this.teamA.goals > this.teamB.goals ? WonTeam.TeamA : WonTeam.TeamB;
  }
}

const USER: User[] = [
  {
    id: 0,
    fullname: 'Mathias Schütz'
  },
  {
    id: 1,
    fullname: 'Michael Lafnitzegger'
  },
  {
    id: 2,
    fullname: 'Benny Foladi'
  },
  {
    id: 3,
    fullname: 'Marco Lahres'
  }
];

const DATABASE: Game[] = [
  new Game({
    teamA: new Team([
      {
        userid: 0,
        goals: 4,
        position: Position.Goalkeeper
      }
    ]),
    teamB: new Team([
      {
        userid: 3,
        goals: 10,
        position: Position.Goalkeeper
      }
    ]),
  }),
  new Game({
    teamA: new Team([
      {
        userid: 3,
        goals: 3,
        position: Position.Goalkeeper
      },
      {
        userid: 0,
        goals: 4,
        position: Position.Striker
      }
    ]),
    teamB: new Team([
      {
        userid: 1,
        goals: 4,
        position: Position.Goalkeeper
      },
      {
        userid: 2,
        goals: 6,
        position: Position.Striker
      }
    ]),
  }),
];

export interface DisplayPlayer extends Player {
  wins?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Tischkicker - Bestenliste';
  displayedColumns: string[] = ['ranking', 'fullname', 'goals', 'wins'];
  dataSourcePlayers = null;
  dataSourceGames = null;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const sumPlayers: DisplayPlayer[] = [];

    for (const game of DATABASE) {
      // Team A
      for (const playerA of game.teamA.players) {
        let player = sumPlayers.find(g => g.userid === playerA.userid);
        if (player === undefined) {
          // sumPlayers.push(playerA);
          player = playerA;

          if (game.wonTeam === WonTeam.TeamA) {
            if (player.wins) {
              player.wins++;
            } else {
              player.wins = 1;
            }
          }

          sumPlayers.push(player);
        } else {
          player.goals += playerA.goals;
        }
      }

      // Team B
      for (const playerB of game.teamB.players) {
        let player = sumPlayers.find(g => g.userid === playerB.userid);
        if (player === undefined) {
          // sumPlayers.push(playerB);
          player = playerB;

          if (game.wonTeam === WonTeam.TeamB) {
            if (player.wins) {
              player.wins++;
            } else {
              player.wins = 1;
            }
          }

          sumPlayers.push(player);
        } else {
          player.goals += playerB.goals;
        }
      }
    }

    this.dataSourcePlayers = new MatTableDataSource(sumPlayers
      .sort((a, b) => a.goals > b.goals ? 1 : 0)
      .map(player => {
        const user = USER.find(u => u.id === player.userid);
        if (user !== undefined) {
          return {
            ranking: 0,
            fullname: user.fullname,
            goals: player.goals,
            wins: player.wins ? player.wins : 0
          };
        }
      }));

    // this.dataSourceGames = new MatTableDataSource

    this.dataSourcePlayers.sort = this.sort;
    this.sort.active = 'goals';
    this.sort.direction = 'desc';
  }

  addGame() {
    const dialog = this.dialog.open(AddGameComponent);
  }
}
