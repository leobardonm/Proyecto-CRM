

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
      </header>

      <main className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</h3>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">1,482</span>
              </div>
            </div>
            <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Deals</h3>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">64</span>
              </div>
            </div>
            <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue MTD</h3>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">$24.5k</span>
              </div>
            </div>
            <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Due</h3>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">12</span>
              </div>
            </div>
          </div>

          {/* Recent Activities & Tasks */}
          <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-2">
            {/* Recent Activities */}
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activities</h2>
              <div className="mt-4 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm text-blue-600">#{item}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        New lead created
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tasks</h2>
              <div className="mt-4 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        Follow up with Client #{item}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due in 2 days</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
