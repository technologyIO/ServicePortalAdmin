import React from "react";

export default function Step3Skills({ 
  Skill, 
  selectedSkill, 
  setSelectedSkill 
}) {
  const isSkillFullySelected = (skill) => {
    return (
      Array.isArray(skill.products) &&
      skill.products.every((p) => selectedSkill[p._id])
    );
  };

  const handleSkillCheckboxChange = (skill, isChecked) => {
    const newSelections = { ...selectedSkill };
    if (Array.isArray(skill.products)) {
      skill.products.forEach((product) => {
        newSelections[product._id] = isChecked;
      });
    }
    setSelectedSkill(newSelections);
  };

  const handleProductCheckboxChange = (productId, isChecked) => {
    setSelectedSkill((prev) => ({
      ...prev,
      [productId]: isChecked,
    }));
  };

  const handleSelectAll = () => {
    const allSelections = {};
    Skill.forEach((skill) => {
      if (Array.isArray(skill.products)) {
        skill.products.forEach((product) => {
          allSelections[product._id] = true;
        });
      }
    });
    setSelectedSkill(allSelections);
  };

  const handleDeselectAll = () => {
    setSelectedSkill({});
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-blue-900">
          Skills & Expertise
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Select All Skills
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600 transition-colors text-sm"
          >
            Deselect All Skills
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3">
        {Array.isArray(Skill) &&
          Skill.map((skill) => (
            <div
              key={skill.productgroup}
              className="mb-6 border-b pb-4"
            >
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={isSkillFullySelected(skill)}
                  onChange={(e) =>
                    handleSkillCheckboxChange(skill, e.target.checked)
                  }
                  className="mr-2"
                />
                <label className="text-lg font-bold text-blue-800">
                  {skill.productgroup}
                </label>
              </div>
              <ul className="pl-6 space-y-1">
                {Array.isArray(skill.products) &&
                  skill.products.map((product) => (
                    <li key={product._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!!selectedSkill[product._id]}
                        onChange={(e) =>
                          handleProductCheckboxChange(
                            product._id,
                            e.target.checked
                          )
                        }
                        className="mr-2"
                      />
                      <span>{product.product}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
