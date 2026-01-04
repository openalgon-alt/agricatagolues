import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { dataService, EditorialBoardMember, EditorialSection } from '@/services/dataService';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Loader2, MapPin, Mail, Building2 } from 'lucide-react';

const EditorialBoard = () => {
  const [sections, setSections] = useState<EditorialSection[]>([]);
  const [members, setMembers] = useState<EditorialBoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedSections, fetchedMembers] = await Promise.all([
          dataService.getEditorialSections(),
          dataService.getEditorialBoardMembers()
        ]);
        setSections(fetchedSections);
        setMembers(fetchedMembers);
      } catch (e) {
        console.error("Failed to load editorial board");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getMembersForSection = (section: EditorialSection) => {
    return members.filter(m => {
      if (m.section_id) return m.section_id === section.id;
      // Fallback for old records
      if (!section.title) return false;
      const lowerTitle = section.title.toLowerCase();
      if (lowerTitle.includes("chief") && m.category === "Chief") return true;
      if (lowerTitle.includes("associate") && m.category === "Associate") return true;
      if (lowerTitle.includes("founder") && m.category === "Founder") return true;
      if (lowerTitle.includes("reviewer") && m.category === "Reviewer") return true;
      return false;
    });
  };

  // --- Horizontal Card (Restored Layout with Modern Styles) ---
  const HorizontalCard = ({ member }: { member: EditorialBoardMember }) => (
    <div className="flex flex-col md:flex-row bg-[#dbe8f3] rounded-lg overflow-hidden shadow-md border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 mb-6 group">
      {/* Left Image Section - Fixed layout like before but better object-fit */}
      {/* Left Image Section - Fixed layout like before but better object-fit */}
      <div className="md:w-48 lg:w-56 shrink-0 bg-white flex items-center justify-center p-2 w-full">
        {member.image_url ? (
          <div className="w-full h-auto md:h-64 relative overflow-hidden rounded border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow">
            <img
              src={member.image_url}
              alt={member.name}
              className="w-full h-auto md:h-full md:object-cover md:absolute md:inset-0"
            />
          </div>
        ) : (
          <div className="w-full h-40 md:h-64 bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
            No Image
          </div>
        )}
      </div>

      {/* Right Content Section */}
      <div className="p-6 flex flex-col justify-center gap-2 grow">
        <h3 className="text-[#1a365d] text-2xl font-bold font-display tracking-tight group-hover:text-blue-800 transition-colors">{member.name}</h3>

        <p className="text-blue-700 font-semibold text-lg">{member.role}</p>

        {member.affiliation && (
          <div className="flex items-start gap-2 text-[#4a5568]">
            <Building2 className="w-4 h-4 mt-1 shrink-0 opacity-70" />
            <span className="text-sm font-medium leading-relaxed">{member.affiliation}</span>
          </div>
        )}

        {member.location && (
          <div className="flex items-center gap-2 text-[#718096]">
            <MapPin className="w-4 h-4 shrink-0 opacity-70" />
            <span className="text-sm">{member.location}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-2">
          {member.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-[#2d3748]">Email:</span>
              <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline hover:text-blue-800 font-medium">
                {member.email}
              </a>
            </div>
          )}

          {member.profile_link && (
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-[#2d3748]">Institutional Profile:</span>
              <a href={member.profile_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline hover:text-blue-800 font-medium">
                View Profile
              </a>
            </div>
          )}
        </div>

        {/* Custom Fields */}
        {member.custom_fields && member.custom_fields.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {member.custom_fields.map((field, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-blue-800 border border-blue-100 shadow-sm">
                {field.label}: {field.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // --- Vertical Card (Stacked for Associates) ---
  const AssociateCard = ({ member }: { member: EditorialBoardMember }) => (
    <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group hover:-translate-y-1">
      <div className="h-64 overflow-hidden bg-slate-100 relative border-b border-slate-100">
        {member.image_url ? (
          <img
            src={member.image_url}
            alt={member.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
        )}
      </div>
      <div className="p-6 flex flex-col grow">
        <h3 className="text-xl font-bold text-[#1a365d] mb-1 group-hover:text-blue-700 transition-colors">{member.name}</h3>
        <p className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wide">{member.role}</p>

        <div className="space-y-2 text-sm text-slate-600 mb-4 grow">
          {member.affiliation && <p className="line-clamp-3 leading-relaxed">{member.affiliation}</p>}
          {member.location && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{member.location}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 mt-auto space-y-2">
          {member.email && (
            <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
              <Mail className="w-3.5 h-3.5" /> {member.email}
            </a>
          )}
          {member.profile_link && (
            <a href={member.profile_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Profile
            </a>
          )}
          {/* Custom Fields */}
          {member.custom_fields && member.custom_fields.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {member.custom_fields.map((field, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  {field.label}: {field.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // --- Reviewer / Compact Card (Grid Layout) ---
  const ReviewerCard = ({ member }: { member: EditorialBoardMember }) => (
    <div className="bg-white rounded border border-slate-200 p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <h3 className="font-bold text-[#1a365d] text-base mb-1">{member.name}</h3>
      <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">{member.role}</p>

      {member.affiliation && <p className="text-sm text-slate-600 mb-1 leading-snug line-clamp-2" title={member.affiliation}>{member.affiliation}</p>}

      {member.location && (
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" /> {member.location}
        </p>
      )}

      {member.email && (
        <a href={`mailto:${member.email}`} className="text-xs text-blue-600 hover:underline block truncate mt-auto pt-2 border-t border-slate-50">
          {member.email}
        </a>
      )}

      {/* Custom Fields Compact */}
      {member.custom_fields?.map((f, i) => (
        <p key={i} className="text-xs text-slate-500 mt-1">
          <span className="font-semibold text-slate-700">{f.label}:</span> {f.value}
        </p>
      ))}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Editorial Board | AgriScience Research Journal</title>
      </Helmet>
      <Layout>
        <div className="bg-slate-50 py-16 min-h-screen">
          <div className="container-magazine max-w-7xl mx-auto px-4">

            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1a365d] mb-4">Editorial Board</h1>
              <div className="w-24 h-1 bg-[#c53030] mx-auto mb-4"></div>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Our distinguished team of experts ensuring the highest standards of scientific publication.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
            ) : (
              <div className="space-y-16">
                {sections.map(section => {
                  const sectionMembers = getMembersForSection(section);
                  if (sectionMembers.length === 0) return null;

                  const title = section.title.toLowerCase();
                  const isReviewer = title.includes('reviewer');
                  const isAssociate = title.includes('associate') || title.includes('assistant');

                  return (
                    <section key={section.id} className="scroll-mt-20">
                      <h2 className="text-2xl md:text-3xl font-bold text-[#c53030] text-center mb-10 uppercase tracking-widest relative">
                        {section.title}
                        <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gray-300"></span>
                      </h2>

                      {isReviewer ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                          {sectionMembers.map(m => <ReviewerCard key={m.id} member={m} />)}
                        </div>
                      ) : (
                        <div className={isAssociate ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "max-w-4xl mx-auto"}>
                          {sectionMembers.map(m => <HorizontalCard key={m.id} member={m} />)}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default EditorialBoard;
