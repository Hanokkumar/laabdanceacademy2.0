import React from 'react';
import { Calendar, Tag } from 'lucide-react';
import { classSchedule } from '../data/mockData';
import useScrollAnimation from '../hooks/useScrollAnimation';

const ClassScheduleSection = () => {
  const [ref, isVisible] = useScrollAnimation();
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <section className="py-20 lg:py-28 bg-[#f5f5f5]">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-[2px] bg-primary" />
            <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">
              Schedule
            </span>
            <div className="w-10 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] font-manrope">
            Class Schedule
          </h2>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="bg-primary text-white font-manrope font-semibold text-sm uppercase tracking-wider py-4 px-4 text-left rounded-tl-lg">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Time
                  </div>
                </th>
                {dayLabels.map((day, i) => (
                  <th
                    key={day}
                    className={`bg-primary text-white font-manrope font-semibold text-sm uppercase tracking-wider py-4 px-4 text-center ${
                      i === dayLabels.length - 1 ? 'rounded-tr-lg' : ''
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classSchedule.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-primary/5 transition-colors duration-300`}
                >
                  <td className="py-4 px-4 font-manrope font-semibold text-sm text-[#111] border-b border-gray-100">
                    {row.time}
                  </td>
                  {days.map((day) => (
                    <td
                      key={day}
                      className="py-4 px-4 text-center font-dm-sans text-sm text-gray-600 border-b border-gray-100 hover:text-primary transition-colors duration-300 cursor-default"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Tag size={12} className="text-primary/40" />
                        {row[day]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ClassScheduleSection;
