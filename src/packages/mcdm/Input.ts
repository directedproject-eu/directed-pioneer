// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

export const MCDMInput = {
    "metrics": [
        { "group": "1", "measure": "Barrier", "haz_type": "CF", "measure net cost": 12800000.0, "averted risk_aai": 178814.5417185635, "bcr_aai": 0.0139698861, "npv_aai": 3672261.948216914, "approval": 2, "feasability": 3, "durability": 6, "externalities": 2, "implementation time": 4 },
        { "group": "2", "measure": "Barrier", "haz_type": "CF", "measure net cost": 12800000.0, "averted risk_aai": 428443.4268738218, "bcr_aai": 0.0334721427, "npv_aai": 5983790.95618395, "approval": 2, "feasability": 3, "durability": 6, "externalities": 2, "implementation time": 4 },
        { "group": "All", "measure": "Barrier", "haz_type": "CF", "measure net cost": 12800000.0, "averted risk_aai": 607257.9685923848, "bcr_aai": 0.0474420288, "npv_aai": 9656052.904400865, "approval": 2, "feasability": 3, "durability": 6, "externalities": 2, "implementation time": 4 },
        { "group": "1", "measure": "Building code", "haz_type": "CF", "measure net cost": 50000000.0, "averted risk_aai": 3237484.1887052855, "bcr_aai": 0.0647496838, "npv_aai": 613592.3012301922, "approval": 7, "feasability": 6, "durability": 8, "externalities": 8, "implementation time": 6 },
        { "group": "2", "measure": "Building code", "haz_type": "CF", "measure net cost": 50000000.0, "averted risk_aai": 6002108.811237466, "bcr_aai": 0.1200421762, "npv_aai": 410125.5718203066, "approval": 7, "feasability": 6, "durability": 8, "externalities": 8, "implementation time": 6 },
        { "group": "All", "measure": "Building code", "haz_type": "CF", "measure net cost": 50000000.0, "averted risk_aai": 9239592.99994275, "bcr_aai": 0.18479186, "npv_aai": 1023717.8730504997, "approval": 7, "feasability": 6, "durability": 8, "externalities": 8, "implementation time": 6 },
        { "group": "1", "measure": "Relocate", "haz_type": "CF", "measure net cost": 8000000000.0, "averted risk_aai": 2930878.3341347706, "bcr_aai": 0.0003663598, "npv_aai": 920198.1558007072, "approval": 1, "feasability": 8, "durability": 10, "externalities": 10, "implementation time": 3 },
        { "group": "2", "measure": "Relocate", "haz_type": "CF", "measure net cost": 8000000000.0, "averted risk_aai": 4076994.2044992484, "bcr_aai": 0.0005096243, "npv_aai": 2335240.1785585238, "approval": 1, "feasability": 8, "durability": 10, "externalities": 10, "implementation time": 3 },
        { "group": "All", "measure": "Relocate", "haz_type": "CF", "measure net cost": 8000000000.0, "averted risk_aai": 7007872.538634019, "bcr_aai": 0.0008759841, "npv_aai": 3255438.3343592305, "approval": 1, "feasability": 8, "durability": 10, "externalities": 10, "implementation time": 3 }
    ],
    "criterias_to_consider": [
        "measure net cost",
        "averted risk_aai",
        "bcr_aai",
        "npv_aai",
        "averted risk_rp_100",
        "bcr_rp_100",
        "npv_rp_100",
        "approval",
        "feasability",
        "durability",
        "externalities",
        "implementation time"
    ],
    "custom_criterias": {
        "approval": { "Barrier": 2, "Building code": 7, "no_measure": 3, "Relocate": 1 },
        "feasability": { "Barrier": 3, "Building code": 6, "no_measure": 10, "Relocate": 8 },
        "durability": { "Barrier": 6, "Building code": 8, "no_measure": 0, "Relocate": 10 },
        "externalities": { "Barrier": 2, "Building code": 8, "no_measure": 0, "Relocate": 10 },
        "implementation time": { "Barrier": 4, "Building code": 6, "no_measure": 10, "Relocate": 3 }
    },
    "constraints": {
        "averted risk_aai_All": { "greater": 0 },
        "measure net cost": { "less": 10000000000 }
    },
    "group_cols": ["group"]
};