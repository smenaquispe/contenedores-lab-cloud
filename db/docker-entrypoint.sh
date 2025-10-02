#!/bin/bash
set -e

# Initialize PostgreSQL data directory
mkdir -p /var/lib/postgresql/data
chown -R postgres:postgres /var/lib/postgresql
chmod 700 /var/lib/postgresql/data

# Switch to postgres user and initialize database
su postgres -c "
    # Initialize database if not exists
    if [ ! -s '/var/lib/postgresql/data/PG_VERSION' ]; then
        echo 'Initializing PostgreSQL database...'
        initdb -D /var/lib/postgresql/data --auth-local=trust --auth-host=md5
        
        # Start PostgreSQL temporarily
        pg_ctl -D /var/lib/postgresql/data -l /var/lib/postgresql/data/logfile start
        
        # Wait for PostgreSQL to start
        sleep 3
        
        # Create user and database
        createuser -s '$POSTGRES_USER' 2>/dev/null || true
        psql -c \"ALTER USER $POSTGRES_USER PASSWORD '$POSTGRES_PASSWORD';\"
        createdb -O '$POSTGRES_USER' '$POSTGRES_DB' 2>/dev/null || true
        
        # Run initialization script
        if [ -f /tmp/init.sql ]; then
            psql -U '$POSTGRES_USER' -d '$POSTGRES_DB' -f /tmp/init.sql
        fi
        
        # Stop PostgreSQL
        pg_ctl -D /var/lib/postgresql/data stop
        
        # Configure PostgreSQL
        echo \"listen_addresses = '*'\" >> /var/lib/postgresql/data/postgresql.conf
        echo \"host all all 0.0.0.0/0 md5\" >> /var/lib/postgresql/data/pg_hba.conf
    fi
    
    # Start PostgreSQL
    exec postgres -D /var/lib/postgresql/data
"
