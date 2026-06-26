import { GameState, SkillState } from './types';
import { GAME_CONFIG } from './constants';

export class SkillSystem {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  public activateSkill(skillId: string, duration: number, cooldown: number) {
    const skill = this.state.skills[skillId];
    if (!skill || skill.cooldownRemaining > 0 || skill.isActive) return;

    skill.isActive = true;
    skill.remainingDuration = duration;
    skill.cooldownRemaining = cooldown;
  }

  public update(deltaTime: number) {
    Object.keys(this.state.skills).forEach(id => {
      const skill = this.state.skills[id];
      
      if (skill.isActive) {
        skill.remainingDuration -= deltaTime;
        if (skill.remainingDuration <= 0) {
          skill.isActive = false;
          skill.remainingDuration = 0;
        }
      }

      if (skill.cooldownRemaining > 0) {
        skill.cooldownRemaining -= deltaTime;
        if (skill.cooldownRemaining < 0) {
          skill.cooldownRemaining = 0;
        }
      }
    });
  }

  public isSkillActive(skillId: string): boolean {
    return this.state.skills[skillId]?.isActive || false;
  }

  public getGoldMultiplierClick(): number {
    return this.isSkillActive('golden_harvest') ? GAME_CONFIG.SKILL_CLICK_GOLD_MULTIPLIER : 1;
  }

  public getGoldMultiplierIdle(): number {
    return this.isSkillActive('golden_harvest') ? GAME_CONFIG.SKILL_IDLE_GOLD_MULTIPLIER : 1;
  }
}
