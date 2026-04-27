# 卡皮巴拉图片标签系统

> 最近更新：2026-04-25

## 生图机制

### MiniMax API 调用
```
POST https://api.minimaxi.com/v1/image_generation
Model: image-01
Response format: url
```

**参考图上传腾讯云路径：**
- 上传：`scp -i ~/.ssh/id_rsa_scanpay src.png ubuntu@111.229.173.83:/home/ubuntu/capybara-life/`
- 外链：`https://cpbl.smartmind.top/capy-ref-happy.png`（通过 cpbl.smartmind.top 的 8080 端口）

**重要发现：**
- `subject_reference` (type=character) 对 data URI 支持有限，返回图角色一致性不佳
- 同 prompt + seed 方式无法保证角色一致
- 有效方式：**固定详细文字描述 + 明确色号**

### 透明背景处理

**旧方式（有 bug）：** 简单阈值 `r>225 && g>225 && b>225` → 误伤肚子白色区域

**当前方式（smart transparent）：** Flood fill 从四边边缘开始，只清除与边缘连通的白色背景，内部白色（肚子、脸部）保留
```
Node 脚本：/home/danny/Projects/music-studio/node_modules/jimp
执行：node flood_fill_transparent.js
```

### 生图 Prompt 模板（改进版 - 推荐）

```
Cute chibi capybara character, pure white background PNG, flat kawaii illustration style with soft shading, centered composition taking up 80% of frame.

COLOR PALETTE (exact hex codes):
- Body main: #FFB6C1 (light pink)
- Body shadow/accent: #FF69B4 (hot pink)
- Face/belly: #FFF8E7 (cream white)
- Body: fluffy with visible soft fur texture, short fine hair visible on surface, slightly textured fur not smooth
- Ears: round and flat sitting on top of head
- Eyes: #1A1A2E (near black) with #FFFFFF (white) circular highlight
- Cheeks: #FFB8C9 (rosy pink), rounded oval shape
- Nose: #E75480 (deep pink), small oval
- Mouth: #E75480 (deep pink), small curved line

CHARACTER FEATURES:
- Round compact body, adorable proportions (big head small body)
- Small stubby legs visible at bottom
- Round flat ears on TOP of head (not sticking out to sides)
- Big round eyes with single white highlight dot in each
- Small round nose centered below eyes
- Two rosy cheek ovals on each side of face
- Small smile mouth

POSTURE: [根据具体动作填写，见下表]

STYLE: clean flat kawaii illustration, soft digital art, pastel color harmony, high quality

EXPRESSION: [具体表情描述]
```

**各Action的POSTURE描述：**

| Action | POSTURE |
|--------|---------|
| idle | sitting pose, relaxed posture, round compact body, calm and content |
| standing | standing pose, small legs, straight upright, alert and curious |
| lying | lying down pose, sprawled out on belly, relaxed and comfortable |
| sleeping | curled up sleeping, head resting, eyes closed peacefully |
| eating | sitting with food in paws, mouth near food, enjoying snack |
| drinking | sitting with cup in paws, mouth near drink, sipping happily |
| playing | energetic pose, paws up and playful, bouncing with excitement |
| bathing | in water, splashing playfully, bubbles around, relaxed |

**具体动作示例（优于抽象描述）：**

| 效果 | POSTURE示例 |
|------|-------------|
| sad + idle | sitting pose, holding a green leaf gently in front, relaxed posture |
| crying + eating | sitting pose, holding a slice of watermelon with both paws |
| sick | wrapped in cozy blanket, only head with small legs poking out |
| sleeping | burrowed in soft blanket, only face and ear tips visible |
| eating carrot | nibbling on a orange carrot stick held in front, small paws holding it |

**注意事项：**
- 肚子/脸部用 `#FFF8E7`，禁止纯白 255
- 身体加 fluffy fur 描述会更可爱
- 白色背景 PNG 不要写在 prompt 里让模型自己生成
- **用具体动作描述优于抽象情绪**（如"叼着胡萝卜啃"优于"eating happy"）

---

## 标签规范

格式：`{action},{emotion}`（动作,情绪）

### 动作标签 (Action)
| 标签 | 含义 | 游戏场景 |
|------|------|---------|
| `idle` | 待机/坐着 | 默认状态 |
| `standing` | 站立 | 正常活动 |
| `eating` | 吃东西 | 使用食物道具 |
| `drinking` | 喝水 | 使用饮品 |
| `bathing` | 泡澡 | 使用温泉券 |
| `playing` | 玩耍 | 使用玩具道具 |
| `sleeping` | 睡觉 | 健康/心情极低 |
| `lying` | 躺卧 | 休息状态 |

### 情绪标签 (Emotion)
| 标签 | 含义 | 触发条件 |
|------|------|---------|
| `joyful` | 欢乐 | mood > 85, hunger > 50 |
| `happy` | 开心 | mood > 70, hunger > 30 |
| `calm` | 平静 | mood 50-70, health > 50 |
| `neutral` | 普通 | mood 30-50 |
| `sad` | 难过 | mood < 30 |
| `crying` | 流泪 | mood < 15 |
| `angry` | 生气 | hunger < 20 |
| `scared` | 害怕 | health < 15 |
| `sick` | 生病 | health < 30 |
| `sleepy` | 困倦 | health < 20 或 mood < 20 |
| `peaceful` | 安详 | sleeping 时 mood > 30 |

---

## 当前图片资产

路径：`/home/danny/Projects/capybara-life/assets/`

| 文件名 | 标签 | 透明版本 | 状态 |
|--------|------|---------|------|
| capy_idle_happy.png | idle,happy | -smartt.png | ✅ |
| capy_standing_happy.png | standing,happy | -smartt.png | ✅ |
| capy_standing_joyful.png | standing,joyful | -smartt.png | ✅ |
| capy_eating_happy.png | eating,happy | -smartt.png | ✅ |
| capy_sleeping_peaceful.png | sleeping,peaceful | -smartt.png | ✅ |
| capy_lying_sleepy.png | lying,sleepy | -smartt.png | ✅ |
| capy_idle_sad.png | idle,sad | -smartt.png | ✅ |
| capy_idle_crying.png | idle,crying | -smartt.png | ✅ |
| capy_idle_sick.png | idle,sick | -smartt.png | ✅ |
| capy_standing_angry.png | standing,angry | -smartt.png | ✅ |
| capy_standing_scared.png | standing,scared | -smartt.png | ✅ |
| capy_bathing_happy.png | bathing,happy | -smartt.png | ✅ |
| capy_playing_joyful.png | playing,joyful | -smartt.png | ✅ |
| capy_idle_neutral.png | idle,neutral | -smartt.png | ✅ |
| capy_drinking_happy.png | drinking,happy | -smartt.png | ✅ |
| capy_lying_calm.png | lying,calm | -smartt.png | ✅ |

---

## 游戏逻辑映射表

### 心情值 (mood) → 情绪标签
```
mood > 85  → joyful  (standing_joyful)
mood 70-85 → happy   (standing_happy)
mood 50-70 → calm    (idle_happy)
mood 30-50 → neutral (idle_neutral)
mood 15-30 → sad     (idle_sad)
mood < 15  → crying  (idle_crying)
```

### 健康值 (health) → 动作/情绪
```
health < 15 → scared  (standing_scared)
health < 20 → sleepy  (sleeping_peaceful / lying_sleepy)
health < 30 → sick    (idle_sick)
```

### 饥饿值 (hunger) → 情绪
```
hunger < 20 → angry  (idle_angry / standing_angry)
```

### 特殊动作优先级（最高优先）
```
使用食物 → eating,happy
使用温泉 → bathing,happy
使用玩具 → playing,joyful
使用饮品 → drinking,happy
```

### 状态优先级（从高到低）
1. `sleeping` — 极低生命或心情
2. `sick` / `angry` — 低生命或饥饿
3. `crying` / `scared` — 极低心情
4. `eating` / `bathing` / `playing` / `drinking` — 使用道具时
5. `sad` / `neutral` — 低心情
6. `happy` / `joyful` — 正常心情
7. `idle` — 默认待机

---

## 待生成

- walking 系列（walking_happy, walking_sad, walking_neutral）
- 更多 eating 变体（不同食物：胡萝卜、烤肉、寿司）
- 更多 bathing 变体（bathind_neutral, bathing_peaceful）
- 更多 playing 变体（玩毛线球、看书、精灵伙伴）
- 站立 neutral
- 更多 scared 变体

---

## 文件位置

| 文件 | 路径 |
|------|------|
| 游戏入口 | `~/Projects/capybara-life/index.html` |
| 图片资产 | `~/Projects/capybara-life/assets/` |
| 标签文档 | `~/Projects/capybara-life/capybara_tags.md` |
| 备份原版 | `~/Projects/capybara-life/index.html.bak` |
