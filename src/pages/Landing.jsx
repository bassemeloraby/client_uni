import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBuilding, FaUsers } from 'react-icons/fa';

const Landing = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-primary mb-4">
            Welcome to UNI Pharmacy
          </h1>
          <p className="text-2xl text-base-content/70 mb-8">
            Manage your pharmacies and users efficiently
          </p>
        </div>

        <div className={`grid gap-6 mb-12 ${user?.userRole === 'admin' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <FaBuilding className="text-4xl text-primary" />
                </div>
                <h2 className="card-title text-2xl">Pharmacies</h2>
              </div>
              <p className="text-base-content/70 mb-4">
                Browse and manage all pharmacies in the system. View details, create new pharmacies, and update existing ones.
              </p>
              {user ? (
                <Link to="/pharmacies" className="btn btn-primary gap-2">
                  View Pharmacies
                  <FaArrowRight />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary gap-2">
                  Sign In to Access
                  <FaArrowRight />
                </Link>
              )}
            </div>
          </div>

          {user?.userRole === 'admin' && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <FaUsers className="text-4xl text-primary" />
                  </div>
                  <h2 className="card-title text-2xl">User Management</h2>
                </div>
                <p className="text-base-content/70 mb-4">
                  Manage users, roles, and permissions. Only administrators can access this section.
                </p>
                <Link to="/users" className="btn btn-primary gap-2">
                  Manage Users
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          )}
        </div>

        {!user && (
          <div className="text-center">
            <p className="text-lg text-base-content/70 mb-4">
              Please sign in to access the full features
            </p>
            <Link to="/login" className="btn btn-primary btn-lg gap-2">
              Sign In
              <FaArrowRight />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
