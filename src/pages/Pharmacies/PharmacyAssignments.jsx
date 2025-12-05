import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { 
  FaStore, 
  FaUserShield, 
  FaUser, 
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaWhatsapp
} from 'react-icons/fa';
import { customFetch } from '../../utils';

export const loader = async ({ request }) => {
  try {
    const response = await customFetch.get('pharmacies');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch pharmacies');
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch pharmacies');
  }
};

const PharmacyAssignments = () => {
  const pharmacies = useLoaderData();

  // Format WhatsApp number for link
  const formatWhatsAppNumber = (number) => {
    if (!number) return '';
    let cleaned = number.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '966' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('966') && cleaned.length > 0) {
      if (cleaned.length === 9 && cleaned.startsWith('5')) {
        cleaned = '966' + cleaned;
      }
      if (cleaned.length === 10 && cleaned.startsWith('05')) {
        cleaned = '966' + cleaned.substring(1);
      }
    }
    return cleaned;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-6xl font-bold text-blue-500 mb-2">
            Pharmacy Assignments
          </h1>
          <p className="text-lg text-base-content/70">
            View all pharmacy assignments including supervisors and pharmacists
          </p>
        </div>
        <Link
          to="/pharmacies"
          className="btn btn-ghost gap-2"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Pharmacies
        </Link>
      </div>

      {pharmacies && pharmacies.length > 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th className="text-center">Branch Code</th>
                    <th>Pharmacy Name</th>
                    <th>Supervisor</th>
                    <th>Pharmacists</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacies.map((pharmacy) => (
                    <tr key={pharmacy._id} className="hover">
                      {/* Branch Code */}
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <FaStore className="text-primary text-lg" />
                          <span className="font-bold text-lg">{pharmacy.branchCode}</span>
                        </div>
                      </td>

                      {/* Pharmacy Name */}
                      <td>
                        <div className="font-semibold">{pharmacy.name}</div>
                        {pharmacy.address?.city && (
                          <div className="text-sm text-base-content/70">
                            {pharmacy.address.city}
                          </div>
                        )}
                      </td>

                      {/* Supervisor */}
                      <td>
                        {pharmacy.supervisor ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FaUserShield className="text-warning" />
                              <span className="font-semibold">
                                {pharmacy.supervisor.firstName} {pharmacy.supervisor.lastName}
                              </span>
                            </div>
                            <div className="text-sm text-base-content/70">
                              @{pharmacy.supervisor.username}
                            </div>
                            {pharmacy.supervisor.email && (
                              <div className="flex items-center gap-1 text-xs">
                                <FaEnvelope className="text-primary" />
                                <a
                                  href={`mailto:${pharmacy.supervisor.email}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {pharmacy.supervisor.email}
                                </a>
                              </div>
                            )}
                            {pharmacy.supervisor.phone && (
                              <div className="flex items-center gap-1 text-xs">
                                <FaPhone className="text-primary" />
                                <a
                                  href={`tel:${pharmacy.supervisor.phone}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {pharmacy.supervisor.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-base-content/50 italic">No supervisor assigned</span>
                        )}
                      </td>

                      {/* Pharmacists */}
                      <td>
                        {pharmacy.pharmacists && pharmacy.pharmacists.length > 0 ? (
                          <div className="space-y-2">
                            {pharmacy.pharmacists.map((pharmacist) => (
                              <div
                                key={pharmacist._id}
                                className="bg-base-200 p-2 rounded-lg space-y-1"
                              >
                                <div className="flex items-center gap-2">
                                  <FaUser className="text-info" />
                                  <span className="font-medium text-sm">
                                    {pharmacist.firstName} {pharmacist.lastName}
                                  </span>
                                </div>
                                <div className="text-xs text-base-content/70 ml-6">
                                  @{pharmacist.username}
                                </div>
                                {pharmacist.email && (
                                  <div className="flex items-center gap-1 text-xs ml-6">
                                    <FaEnvelope className="text-primary" />
                                    <a
                                      href={`mailto:${pharmacist.email}`}
                                      className="hover:text-primary transition-colors truncate max-w-xs"
                                    >
                                      {pharmacist.email}
                                    </a>
                                  </div>
                                )}
                                {pharmacist.phone && (
                                  <div className="flex items-center gap-1 text-xs ml-6">
                                    <FaPhone className="text-primary" />
                                    <a
                                      href={`tel:${pharmacist.phone}`}
                                      className="hover:text-primary transition-colors"
                                    >
                                      {pharmacist.phone}
                                    </a>
                                  </div>
                                )}
                                {pharmacist.whatsapp && (
                                  <div className="flex items-center gap-1 text-xs ml-6">
                                    <FaWhatsapp className="text-green-500" />
                                    <a
                                      href={`https://wa.me/${formatWhatsAppNumber(pharmacist.whatsapp)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-green-500 transition-colors"
                                    >
                                      {pharmacist.whatsapp}
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-base-content/50 italic">No pharmacists assigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-center">
                        <Link
                          to={`/pharmacies/${pharmacy._id}`}
                          className="btn btn-sm btn-primary gap-2"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="5" className="text-center">
                      Total Pharmacies: {pharmacies.length}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-12">
            <FaStore className="text-6xl text-base-content/30 mx-auto mb-4" />
            <p className="text-2xl text-base-content/70 mb-4">No pharmacies found</p>
            <Link to="/pharmacies/create" className="btn btn-primary gap-2">
              Create Pharmacy
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyAssignments;
