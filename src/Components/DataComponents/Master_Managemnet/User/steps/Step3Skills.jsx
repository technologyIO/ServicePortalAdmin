"use client";
import { Check, CheckSquare, Square } from "lucide-react";

export default function Step3Skills({
  Skill,
  selectedSkill,
  setSelectedSkill,
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

  const CustomCheckbox = ({ checked, onChange, className = "" }) => (
    <div className={`relative cursor-pointer ${className}`} onClick={onChange}>
      <div
        className={`
        w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
        ${
          checked
            ? "bg-blue-600 border-blue-600 shadow-md"
            : "border-gray-300 hover:border-blue-400 bg-white"
        }
      `}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
    </div>
  );

  return (
    <div className="max-w-8xl mx-auto   bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header Section */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              Skills & Expertise
            </h2>
            <p className="text-gray-600">
              Select your areas of expertise and specific skills
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="group bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              Select All Skills
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="group bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Deselect All Skills
            </button>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(Skill) &&
            Skill.map((skill, index) => (
              <div
                key={skill.productgroup}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg p-6"
              >
                {/* Skill Category Header */}
                <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                  <CustomCheckbox
                    checked={isSkillFullySelected(skill)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSkillCheckboxChange(
                        skill,
                        !isSkillFullySelected(skill)
                      );
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-800 group-hover:text-blue-900 transition-colors">
                      {skill.productgroup}
                    </h3>
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mt-1"></div>
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-3">
                  {Array.isArray(skill.products) &&
                    skill.products.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center group/item hover:bg-blue-50 rounded-lg p-2 -m-2 transition-all duration-200"
                      >
                        <CustomCheckbox
                          checked={!!selectedSkill[product._id]}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleProductCheckboxChange(
                              product._id,
                              !selectedSkill[product._id]
                            );
                          }}
                          className="mr-3"
                        />
                        <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors font-medium">
                          {product.product}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Skill Count Badge */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">
                      {skill.products?.filter((p) => selectedSkill[p._id])
                        .length || 0}{" "}
                      of {skill.products?.length || 0} selected
                    </span>
                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                        style={{
                          width: `${
                            ((skill.products?.filter(
                              (p) => selectedSkill[p._id]
                            ).length || 0) /
                              (skill.products?.length || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-600">
              <span className="font-semibold text-blue-900">
                {Object.values(selectedSkill).filter(Boolean).length}
              </span>{" "}
              skills selected across{" "}
              <span className="font-semibold text-blue-900">
                {Skill?.length || 0}
              </span>{" "}
              categories
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Click category name to select all items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
